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

/** Formats a validated order into the readable Telegram message (PRD §25). */
export function formatOrderMessage(order: Order, orderId: string): string {
  const divider = "━━━━━━━━━━━━━━━━";
  const e = escapeHtml;

  return [
    "🛍️ <b>طلب جديد - عبايات روجين</b>",
    "",
    divider,
    "",
    `👤 <b>الاسم:</b>\n${e(order.fullName)}`,
    "",
    `📱 <b>رقم الهاتف:</b>\n${e(order.phone)}`,
    "",
    `📍 <b>المحافظة:</b>\n${e(order.governorate)}`,
    "",
    `🏘️ <b>المنطقة:</b>\n${e(order.area)}`,
    "",
    `📌 <b>أقرب نقطة دالة:</b>\n${e(order.landmark)}`,
    "",
    `📏 <b>الطول:</b>\n${order.height} cm`,
    "",
    `⚖️ <b>الوزن:</b>\n${order.weight} kg`,
    "",
    `👗 <b>القياس:</b>\n${e(order.size)}`,
    // Only present when the customer wrote one, so the message stays compact.
    ...(order.note ? ["", `📝 <b>ملاحظة:</b>\n${e(order.note)}`] : []),
    "",
    divider,
    "",
    `🆔 <b>رقم الطلب:</b>\n<code>${e(orderId)}</code>`,
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
