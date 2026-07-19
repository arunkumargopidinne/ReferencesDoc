// Server-side Anthropic helper.
//
// Keeps the same call signature as the previous OpenAI helper — messages may
// include a `system` entry and it is hoisted to the top-level `system`
// parameter that the Messages API expects.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-8";

// The Messages API requires max_tokens, so there is no "unset" case to fall
// back on the way chat/completions allowed.
const DEFAULT_MAX_TOKENS = 1200;

const MISTRAL_MODEL = process.env.MISTRAL_MODEL?.trim() || "mistral-small-latest";

function getApiKeysFromEnv(apiKeyOverride?: string): string[] {
  const candidates = [
    apiKeyOverride,
    process.env.ANTHROPIC_API_KEY,
    process.env.ANTHROPIC_API_KEY_2,
    process.env.ANTHROPIC_API_KEY_3,
    process.env.ANTHROPIC_API_KEY_4,
    process.env.ANTHROPIC_API_KEY_5,
  ];

  const seen = new Set<string>();
  const keys: string[] = [];
  for (const c of candidates) {
    const key = c?.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  return keys;
}

function getMistralApiKeyFromEnv() {
  return process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
}

async function tryLoadDotenv() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const p = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(p)) return;
    let txt = fs.readFileSync(p, "utf8");
    if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
    txt.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    });
  } catch {
    // ignore
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Carries the status and Retry-After so the retry loop does not have to
// scrape them back out of a formatted message string.
class AnthropicApiError extends Error {
  status: number;
  retryAfterMs: number | null;

  constructor(status: number, body: string, retryAfterMs: number | null) {
    super(`Anthropic error: ${status} ${body}`);
    this.name = "AnthropicApiError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function isRateLimitError(e: unknown) {
  // 529 is `overloaded_error` — transient capacity, worth the same treatment.
  return e instanceof AnthropicApiError && (e.status === 429 || e.status === 529);
}

function isAuthError(e: unknown) {
  return e instanceof AnthropicApiError && (e.status === 401 || e.status === 403);
}

// Splits out system messages; the rest must alternate user/assistant.
function splitSystem(messages: ChatMessage[]) {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const rest = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  return { system, messages: rest };
}

async function postMessages(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const retryAfter = res.headers.get("retry-after");
    const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : null;
    throw new AnthropicApiError(
      res.status,
      await res.text(),
      Number.isFinite(retryAfterMs) ? retryAfterMs : null
    );
  }

  return res.json();
}

// Responses are a list of content blocks; concatenate the text ones.
function extractText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const content = (data as { content?: Array<{ type?: string; text?: unknown }> }).content;
  if (!Array.isArray(content)) return "";

  return content
    .map((block) =>
      block?.type === "text" && typeof block.text === "string" ? block.text : ""
    )
    .join("");
}

async function callMistralFallback(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number }
) {
  const mistralApiKey = getMistralApiKeyFromEnv();
  if (!mistralApiKey) throw new Error("Missing MISTRAL_API_KEY for fallback");

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mistralApiKey}` },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages,
      temperature: opts?.temperature ?? 0.2,
      max_tokens: opts?.max_tokens ?? DEFAULT_MAX_TOKENS,
    }),
  });
  if (!res.ok) throw new Error(`Mistral error: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

async function callWithKey(
  apiKey: string,
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number }
) {
  const { system, messages: rest } = splitSystem(messages);

  const data = await postMessages(apiKey, {
    model: DEFAULT_MODEL,
    max_tokens: opts?.max_tokens ?? DEFAULT_MAX_TOKENS,
    temperature: opts?.temperature ?? 0.2,
    ...(system ? { system } : {}),
    messages: rest,
  });

  return extractText(data);
}

const MAX_RATE_LIMIT_ROUNDS = 3;

export async function callAnthropic(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number },
  apiKeyOverride?: string
) {
  let keys = getApiKeysFromEnv(apiKeyOverride);
  if (!keys.length) {
    await tryLoadDotenv();
    keys = getApiKeysFromEnv(apiKeyOverride);
  }

  if (!keys.length) {
    console.warn("callAnthropic: ANTHROPIC_API_KEY missing, using Mistral fallback.");
    return callMistralFallback(messages, opts);
  }

  let lastError: unknown = null;
  let lastRetryAfterMs: number | null = null;

  // Each round tries every key once. Auth failures drop a key for good; rate
  // limits only drop it for this round, since another org may have headroom.
  for (let round = 0; round < MAX_RATE_LIMIT_ROUNDS; round++) {
    let everyFailureWasRateLimit = keys.length > 0;

    for (let i = 0; i < keys.length; i++) {
      try {
        return await callWithKey(keys[i], messages, opts);
      } catch (e: unknown) {
        lastError = e;

        if (isRateLimitError(e)) {
          lastRetryAfterMs = (e as AnthropicApiError).retryAfterMs ?? lastRetryAfterMs;
          console.warn(
            `callAnthropic: key ${i + 1}/${keys.length} rate limited, trying next key.`
          );
          continue;
        }

        everyFailureWasRateLimit = false;

        if (isAuthError(e)) {
          console.warn(
            `callAnthropic: key ${i + 1}/${keys.length} auth failed, trying next key.`
          );
          continue;
        }

        // Anything else (bad request, server error) won't be fixed by another key.
        throw e;
      }
    }

    // Only worth waiting and retrying if rate limiting was the sole blocker.
    if (!everyFailureWasRateLimit || round === MAX_RATE_LIMIT_ROUNDS - 1) break;

    const waitMs = Math.min(lastRetryAfterMs ?? 1000 * 2 ** round, 20000);
    console.warn(
      `callAnthropic: all ${keys.length} key(s) rate limited, waiting ${waitMs}ms before retry.`
    );
    await sleep(waitMs);
  }

  if (isAuthError(lastError) || isRateLimitError(lastError)) {
    const lastMsg = String(lastError instanceof Error ? lastError.message : lastError);
    console.warn("callAnthropic: all Anthropic keys exhausted, using Mistral fallback.");
    try {
      return await callMistralFallback(messages, opts);
    } catch (mistralError: unknown) {
      const mistralMsg = String(
        mistralError instanceof Error ? mistralError.message : mistralError
      );
      // Surface the original Anthropic cause, not just the fallback's failure.
      throw new Error(`${lastMsg} | Mistral fallback also failed: ${mistralMsg}`);
    }
  }

  throw lastError ?? new Error("callAnthropic: no Anthropic key succeeded");
}
