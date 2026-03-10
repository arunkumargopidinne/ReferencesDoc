// // // Server-side OpenAI helper

// // // Defer reading `OPENAI_API_KEY` until the helper is called so importing
// // // this module does not throw during development when env vars may be unset.
// // const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// // async function tryLoadDotenv() {
// //   try {
// //     const fs = await import('fs');
// //     const path = await import('path');
// //     const p = path.resolve(process.cwd(), '.env.local');
// //     const exists = fs.existsSync(p);
// //     console.error('tryLoadDotenv:', p, 'exists=', exists);
// //     if (!exists) return;
// //     let txt = fs.readFileSync(p, 'utf8');
// //     // Strip UTF-8 BOM if present which can break line-start regexes on Windows
// //     if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
// //     console.error('tryLoadDotenv: .env.local length=', txt.length);
// //     txt.split(/\r?\n/).forEach((line) => {
// //       const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
// //       if (!m) return;
// //       const key = m[1];
// //       let val = m[2] || '';
// //       if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
// //       const willSet = !process.env[key];
// //       if (willSet) process.env[key] = val;
// //       console.error('tryLoadDotenv: parsed', { key, len: val.length, willSet, current: process.env[key] ? '[REDACTED]' : null });
// //     });
// //   } catch (e) {
// //     // ignore
// //   }
// // }

// // export async function callOpenAI(messages: Array<{ role: string; content: string }>, opts?: { temperature?: number }, apiKey?: string) {
// //   let OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
// //   if (!OPENAI_API_KEY) {
// //     await tryLoadDotenv();
// //     OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
// //     console.error('callOpenAI: after tryLoadDotenv OPENAI_API_KEY present=', Boolean(OPENAI_API_KEY), 'len=', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
// //   }
// //   if (!OPENAI_API_KEY) {
// //     throw new Error('Missing OPENAI_API_KEY in environment');
// //   }

// //   const body = {
// //     model: DEFAULT_MODEL,
// //     messages,
// //     temperature: opts?.temperature ?? 0.2,
// //     max_tokens: 1200,
// //   };

// //   const res = await fetch('https://api.openai.com/v1/chat/completions', {
// //     method: 'POST',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       Authorization: `Bearer ${OPENAI_API_KEY}`,
// //     },
// //     body: JSON.stringify(body),
// //   });

// //   if (!res.ok) {
// //     const txt = await res.text();
// //     throw new Error(`OpenAI error: ${res.status} ${txt}`);
// //   }

// //   const data = await res.json();
// //   const content = data.choices?.[0]?.message?.content;
// //   return content;
// // }


// // openaiHelper.ts
// type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// const MODEL_CANDIDATES = [
//   // Prefer best first; will pick the first one your project has access to
//   "gpt-4o",
//   "gpt-4o-mini",
//   // add other org-approved models here if you use them
// ];

// let cachedModel: string | null = null;
// let cachedAt = 0;
// const CACHE_MS = 10 * 60 * 1000; // 10 minutes

// async function tryLoadDotenv() {
//   try {
//     const fs = await import("fs");
//     const path = await import("path");
//     const p = path.resolve(process.cwd(), ".env.local");
//     const exists = fs.existsSync(p);
//     console.error("tryLoadDotenv:", p, "exists=", exists);
//     if (!exists) return;

//     let txt = fs.readFileSync(p, "utf8");
//     if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);

//     txt.split(/\r?\n/).forEach((line) => {
//       const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
//       if (!m) return;
//       const key = m[1];
//       let val = m[2] || "";
//       if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

//       if (!process.env[key]) process.env[key] = val;
//     });
//   } catch {
//     // ignore
//   }
// }

// function getApiKeyFromEnv() {
//   return process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
// }

// async function listAvailableModelIds(apiKey: string): Promise<Set<string>> {
//   const res = await fetch("https://api.openai.com/v1/models", {
//     method: "GET",
//     headers: { Authorization: `Bearer ${apiKey}` },
//   });

//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`OpenAI /v1/models error: ${res.status} ${txt}`);
//   }

//   const data = await res.json();
//   const ids = new Set<string>((data.data ?? []).map((m: any) => String(m.id)));
//   return ids;
// }

// async function resolveModel(apiKey: string): Promise<string> {
//   // 1) Allow explicit override via env
//   const envModel = process.env.OPENAI_MODEL?.trim();
//   if (envModel) return envModel;

//   // 2) Use cached model if fresh
//   const now = Date.now();
//   if (cachedModel && now - cachedAt < CACHE_MS) return cachedModel;

//   // 3) Discover allowed models for this project and choose best candidate
//   const ids = await listAvailableModelIds(apiKey);

//   const picked = MODEL_CANDIDATES.find((m) => ids.has(m));
//   if (!picked) {
//     // helpful debug
//     const sample = Array.from(ids).slice(0, 50).join(", ");
//     throw new Error(
//       `No supported model found. Available model ids (sample): ${sample}`
//     );
//   }

//   cachedModel = picked;
//   cachedAt = now;
//   console.error("resolveModel: picked", picked);
//   return picked;
// }

// async function postChatCompletions(apiKey: string, body: any) {
//   const res = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify(body),
//   });

//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`OpenAI error: ${res.status} ${txt}`);
//   }

//   return res.json();
// }

// function isModelAccessError(msg: string) {
//   // Covers: "does not have access to model", model_not_found, etc.
//   return (
//     msg.includes("does not have access to model") ||
//     msg.includes('"code":"model_not_found"') ||
//     msg.includes("model_not_found")
//   );
// }

// export async function callOpenAI(
//   messages: ChatMessage[],
//   opts?: { temperature?: number; max_tokens?: number },
//   apiKeyOverride?: string
// ) {
//   let apiKey = apiKeyOverride || getApiKeyFromEnv();
//   if (!apiKey) {
//     await tryLoadDotenv();
//     apiKey = apiKeyOverride || getApiKeyFromEnv();
//   }
//   if (!apiKey) throw new Error("Missing OPENAI_API_KEY in environment");

//   // Resolve best available model for this project
//   let model = await resolveModel(apiKey);

//   const body = {
//     model,
//     messages,
//     temperature: opts?.temperature ?? 0.2,
//     max_tokens: opts?.max_tokens ?? 1200,
//   };

//   try {
//     const data = await postChatCompletions(apiKey, body);
//     return data?.choices?.[0]?.message?.content ?? "";
//   } catch (e: any) {
//     const msg = String(e?.message ?? "");

//     // If model not permitted, clear cache and retry with next candidate
//     if (isModelAccessError(msg)) {
//       cachedModel = null;
//       cachedAt = 0;

//       // Try candidates in order without /v1/models again
//       for (const candidate of MODEL_CANDIDATES) {
//         if (candidate === model) continue;
//         try {
//           const data = await postChatCompletions(apiKey, {
//             ...body,
//             model: candidate,
//           });
//           cachedModel = candidate;
//           cachedAt = Date.now();
//           console.error("callOpenAI: fallback model used:", candidate);
//           return data?.choices?.[0]?.message?.content ?? "";
//         } catch (e2: any) {
//           const msg2 = String(e2?.message ?? "");
//           if (!isModelAccessError(msg2)) throw e2;
//         }
//       }
//     }

//     throw e;
//   }
// }


type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const MODEL_CANDIDATES = ["gpt-4o-mini", "gpt-4o"];
const MISTRAL_MODEL = process.env.MISTRAL_MODEL?.trim() || "mistral-small-latest";
const HARD_CODED_MISTRAL_FALLBACK_KEY = process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY

let cachedModel: string | null = null;
let cachedAt = 0;
const CACHE_MS = 10 * 60 * 1000;

function getApiKeyFromEnv() {
  return process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}

function getMistralApiKeyFromEnv() {
  return (
    process.env.MISTRAL_API_KEY ||
    process.env.NEXT_PUBLIC_MISTRAL_API_KEY ||
    HARD_CODED_MISTRAL_FALLBACK_KEY
  );
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

async function listAvailableModelIds(apiKey: string): Promise<Set<string>> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI /v1/models error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return new Set<string>((data.data ?? []).map((m: { id: string }) => String(m.id)));
}

async function resolveModel(apiKey: string): Promise<string> {
  const envModel = process.env.OPENAI_MODEL?.trim();
  if (envModel) return envModel;

  const now = Date.now();
  if (cachedModel && now - cachedAt < CACHE_MS) return cachedModel;

  const ids = await listAvailableModelIds(apiKey);
  const picked = MODEL_CANDIDATES.find((m) => ids.has(m));
  if (!picked) {
    const sample = Array.from(ids).slice(0, 50).join(", ");
    throw new Error(`No supported model found. Available (sample): ${sample}`);
  }
  cachedModel = picked;
  cachedAt = now;
  return picked;
}

async function postChatCompletions(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function postMistralChatCompletions(apiKey: string, body: Record<string, unknown>) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Mistral error: ${res.status} ${await res.text()}`);
  return res.json();
}

function extractMessageContent(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const choices = (data as { choices?: Array<{ message?: { content?: unknown } }> }).choices;
  const content = choices?.[0]?.message?.content;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

function isModelAccessError(msg: string) {
  return msg.includes("does not have access to model") || msg.includes("model_not_found");
}

function isOpenAIAuthError(msg: string) {
  const lower = msg.toLowerCase();
  return (
    lower.includes("openai /v1/models error: 401") ||
    lower.includes("openai /v1/models error: 403") ||
    lower.includes("openai error: 401") ||
    lower.includes("openai error: 403") ||
    lower.includes("invalid_api_key") ||
    lower.includes("incorrect api key") ||
    lower.includes("authentication_error")
  );
}

async function callMistralFallback(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number }
) {
  const mistralApiKey = getMistralApiKeyFromEnv();
  if (!mistralApiKey) {
    throw new Error("Missing MISTRAL_API_KEY for fallback");
  }

  const data = await postMistralChatCompletions(mistralApiKey, {
    model: MISTRAL_MODEL,
    messages,
    temperature: opts?.temperature ?? 0.2,
    max_tokens: opts?.max_tokens ?? 1200,
  });

  return extractMessageContent(data);
}

export async function callOpenAI(
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number },
  apiKeyOverride?: string
) {
  let apiKey = apiKeyOverride || getApiKeyFromEnv();
  if (!apiKey) {
    await tryLoadDotenv();
    apiKey = apiKeyOverride || getApiKeyFromEnv();
  }

  if (!apiKey) {
    console.warn("callOpenAI: OPENAI_API_KEY missing, using Mistral fallback.");
    return callMistralFallback(messages, opts);
  }

  try {
    const model = await resolveModel(apiKey);
    const body = {
      model,
      messages,
      temperature: opts?.temperature ?? 0.2,
      max_tokens: opts?.max_tokens ?? 1200,
    };

    try {
      const data = await postChatCompletions(apiKey, body);
      return extractMessageContent(data);
    } catch (e: unknown) {
      const msg = String(e instanceof Error ? e.message : "");
      if (isModelAccessError(msg)) {
        cachedModel = null;
        cachedAt = 0;
        for (const candidate of MODEL_CANDIDATES) {
          if (candidate === model) continue;
          try {
            const data = await postChatCompletions(apiKey, { ...body, model: candidate });
            cachedModel = candidate;
            cachedAt = Date.now();
            return extractMessageContent(data);
          } catch (e2: unknown) {
            const msg2 = String(e2 instanceof Error ? e2.message : "");
            if (!isModelAccessError(msg2)) throw e2;
          }
        }
      }
      throw e;
    }
  } catch (e: unknown) {
    const msg = String(e instanceof Error ? e.message : "");
    if (isOpenAIAuthError(msg)) {
      console.warn("callOpenAI: OpenAI auth failed, using Mistral fallback.");
      return callMistralFallback(messages, opts);
    }
    throw e;
  }
}
