/**
 * Minimal in-memory sliding-window rate limiter (PRD §29).
 *
 * State lives in the serverless instance's memory, so limits are enforced per
 * warm instance rather than globally. That is deliberate for V1: it stops
 * casual scripted spam with zero added infrastructure. If spam becomes a real
 * problem, swap this for a shared store (Upstash/Vercel KV) or Turnstile —
 * only this module needs to change.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
/** Guards against unbounded growth if many distinct IPs hit a warm instance. */
const MAX_TRACKED_KEYS = 10_000;

const hits = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds the caller should wait before retrying. */
  retryAfter: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const recent = (hits.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recent.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
    hits.set(key, recent);
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) pruneExpired(windowStart);

  return { allowed: true, retryAfter: 0 };
}

function pruneExpired(windowStart: number): void {
  for (const [key, timestamps] of hits) {
    const live = timestamps.filter((timestamp) => timestamp > windowStart);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }
}

/** Best-effort client identity from proxy headers, for rate limiting only. */
export function getClientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
