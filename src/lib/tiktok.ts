/**
 * Browser-only TikTok Pixel helpers.
 *
 * Every call here is a no-op when `ttq` is absent — the pixel id is unset, the
 * script is blocked by an ad blocker, or we are rendering on the server.
 * Tracking must never be able to break the order form, so nothing in this
 * module throws.
 */

/**
 * Identifiers for advanced matching. These are passed as PLAINTEXT: the pixel
 * hashes them with SHA-256 in the browser before anything is sent, so no
 * identifying value leaves the device in the clear. Pre-hashing them here
 * would get them hashed twice and match nothing.
 */
type TiktokIdentifyPayload = {
  email?: string;
  phone_number?: string;
  external_id?: string;
};

type TiktokProperties = Record<string, unknown> & { event_id?: string };

type Ttq = {
  page: () => void;
  track: (event: string, properties?: TiktokProperties) => void;
  identify: (payload: TiktokIdentifyPayload) => void;
};

declare global {
  interface Window {
    ttq?: Ttq;
  }
}

/** Empty unless configured, which disables the whole integration. */
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "";

/**
 * Returns the pixel only when it is genuinely usable: in the browser, loaded,
 * and exposing the methods we call. Covers SSR, an unset id and ad blockers in
 * one check.
 */
function getTtq(): Ttq | null {
  if (typeof window === "undefined") return null;
  const ttq = window.ttq;
  return typeof ttq?.track === "function" ? ttq : null;
}

/** How long to wait for the pixel before giving up on an early event. */
const READY_TIMEOUT_MS = 5_000;
const READY_POLL_MS = 200;

/**
 * Runs `send` once the pixel exists.
 *
 * The base snippet is injected with `afterInteractive`, so it is not yet on the
 * page when the first React effects run — an event fired then would otherwise
 * be dropped. Polls briefly and then gives up, so a blocked or unconfigured
 * pixel costs nothing beyond a few idle timers.
 *
 * Note the snippet defines `ttq` as a queue before the SDK arrives, so a call
 * that lands in that window is buffered by TikTok and replayed on load.
 */
function whenReady(send: (ttq: Ttq) => void): void {
  if (typeof window === "undefined") return;

  const immediate = getTtq();
  if (immediate) {
    try {
      send(immediate);
    } catch {
      // Analytics failures must never surface to the customer.
    }
    return;
  }

  const deadline = Date.now() + READY_TIMEOUT_MS;
  const timer = window.setInterval(() => {
    const ttq = getTtq();
    if (ttq) {
      window.clearInterval(timer);
      try {
        send(ttq);
      } catch {
        // Analytics failures must never surface to the customer.
      }
      return;
    }
    if (Date.now() > deadline) window.clearInterval(timer);
  }, READY_POLL_MS);
}

/**
 * Converts the canonical local Iraqi number the schema produces
 * (`07XXXXXXXXX`) into the E.164 form TikTok requires (`+9647XXXXXXXX`).
 *
 * Returns undefined for anything that is not exactly that shape, so a
 * malformed value is omitted rather than sent in a format TikTok would hash
 * into a permanent non-match.
 */
export function toE164Iraqi(localPhone: string): string | undefined {
  return /^07\d{9}$/.test(localPhone) ? `+964${localPhone.slice(1)}` : undefined;
}

/**
 * Opaque per-event id. TikTok deduplicates on it, which makes an event
 * idempotent if the pixel retries on a flaky connection or the component
 * re-mounts.
 */
export function createEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Attaches advanced-matching identifiers to subsequent events. */
export function tiktokIdentify(payload: TiktokIdentifyPayload): void {
  // Drop empty values: TikTok hashes whatever it is handed, and a hashed empty
  // string is a valid-looking but meaningless match signal.
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => Boolean(value)),
  );
  if (Object.keys(cleaned).length === 0) return;

  whenReady((ttq) => ttq.identify(cleaned));
}

export function tiktokTrack(event: string, properties?: TiktokProperties): void {
  whenReady((ttq) => ttq.track(event, properties));
}
