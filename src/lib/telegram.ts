import type { Order } from "./schema";

/**
 * Overridable only so local/integration tests can point at a stub server.
 * Unset in production, where the real Bot API is always used.
 */
const TELEGRAM_API =
  process.env.TELEGRAM_API_BASE_URL ?? "https://api.telegram.org";
const SEND_TIMEOUT_MS = 10_000;

/**
 * Escapes the five characters that matter in Telegram's HTML parse mode, so
 * customer-provided text is always rendered as text and never as markup.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats a validated order into the Telegram message (PRD §25).
 *
 * Laid out for how the store reads it on a phone: label and value share a
 * line, and fields are grouped by what they are used for — who to contact,
 * where to deliver, what to send — so the whole order fits on one screen.
 */
export function formatOrderMessage(order: Order, orderId: string): string {
  const divider = "──────────────";
  const e = escapeHtml;

  /** `<code>` keeps the value selectable and copy-tappable in Telegram. */
  const row = (label: string, value: string) =>
    `<b>${label}:</b> ${value}`;

  return [
    "<b>طلب جديد — عبايات روجين</b>",
    `<code>${e(orderId)}</code>`,
    divider,
    "",
    "<b>الزبونة</b>",
    row("الاسم", e(order.fullName)),
    // Kept bare (no <code>) so Telegram linkifies it into a tap-to-call link.
    row("الهاتف", e(order.phone)),
    "",
    "<b>التوصيل</b>",
    row("المحافظة", e(order.governorate)),
    row("المنطقة", e(order.area)),
    row("أقرب نقطة", e(order.landmark)),
    "",
    "<b>القياسات</b>",
    row("الطول", `${order.height} سم`),
    row("الوزن", `${order.weight} كغم`),
    row("القياس", e(order.size)),
    // Only present when the customer wrote one, so the message stays compact.
    ...(order.note
      ? ["", "<b>ملاحظة</b>", e(order.note)]
      : []),
  ].join("\n");
}

/**
 * Sends the order to the store's Telegram chat.
 * Throws on any non-success response; the caller maps that to a 502 without
 * leaking the token or Telegram's raw response to the customer.
 */
export async function sendOrderToTelegram(
  order: Order,
  orderId: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram credentials are not configured");
  }

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatOrderMessage(order, orderId),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Log the status only — never the token or the customer's details.
    console.error(
      `Telegram sendMessage failed for ${orderId}: HTTP ${response.status}`,
    );
    throw new Error("Telegram rejected the message");
  }
}
