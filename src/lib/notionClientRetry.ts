import { ClientErrorCode, isNotionClientError } from "@notionhq/client";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 400;
const MAX_DELAY_MS = 2500;

type NotionErrorLike = {
  status?: unknown;
  headers?: unknown;
  code?: unknown;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(headerValue: string): number | undefined {
  const asNumber = Number.parseInt(headerValue, 10);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber * 1000;
  }

  const asDate = Date.parse(headerValue);
  if (Number.isFinite(asDate)) {
    const delta = asDate - Date.now();
    if (delta > 0) return delta;
  }

  return undefined;
}

function readHeader(headers: unknown, key: string): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;

  const maybeHeaders = headers as { get?: (name: string) => string | null };
  if (typeof maybeHeaders.get === "function") {
    const value = maybeHeaders.get(key) ?? maybeHeaders.get(key.toLowerCase());
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const asRecord = headers as Record<string, unknown>;
  const directValue = asRecord[key] ?? asRecord[key.toLowerCase()];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue.trim();
  }

  if (Array.isArray(directValue) && typeof directValue[0] === "string") {
    const first = directValue[0].trim();
    return first || undefined;
  }

  return undefined;
}

export function getNotionErrorStatus(error: unknown): number | undefined {
  if (!isNotionClientError(error)) return undefined;
  const status = (error as NotionErrorLike).status;
  return typeof status === "number" ? status : undefined;
}

export function isRetryableNotionWriteError(error: unknown): boolean {
  if (!isNotionClientError(error)) return false;

  if (error.code === ClientErrorCode.RequestTimeout) {
    return true;
  }

  const status = getNotionErrorStatus(error);
  return typeof status === "number" && RETRYABLE_STATUS_CODES.has(status);
}

function computeRetryDelayMs(error: unknown, attempt: number): number {
  if (isNotionClientError(error)) {
    const retryAfterHeader = readHeader(
      (error as NotionErrorLike).headers,
      "retry-after"
    );
    if (retryAfterHeader) {
      const retryAfterMs = parseRetryAfterMs(retryAfterHeader);
      if (typeof retryAfterMs === "number") {
        return Math.min(retryAfterMs, MAX_DELAY_MS);
      }
    }
  }

  const exponential = BASE_DELAY_MS * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 200);
  return Math.min(exponential + jitter, MAX_DELAY_MS);
}

export async function withNotionWriteRetry<T>(
  operationName: string,
  operation: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<T> {
  let currentAttempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const shouldRetry =
        currentAttempt < maxRetries && isRetryableNotionWriteError(error);

      if (!shouldRetry) throw error;

      const delayMs = computeRetryDelayMs(error, currentAttempt);
      const status = getNotionErrorStatus(error);
      console.warn(
        `[notion-retry] ${operationName} failed (attempt ${
          currentAttempt + 1
        }/${maxRetries + 1}, status=${status ?? "n/a"}). Retrying in ${delayMs}ms.`
      );

      await sleep(delayMs);
      currentAttempt += 1;
    }
  }
}
