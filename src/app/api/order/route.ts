import { NextResponse } from "next/server";

import { generateOrderId } from "@/lib/order-id";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/schema";
import { sendOrderToTelegram } from "@/lib/telegram";

/** Generous ceiling for this form; anything larger is not a real order. */
const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientKey(request.headers));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "تم إرسال عدد كبير من الطلبات، يرجى المحاولة بعد قليل." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "حجم الطلب كبير جدًا." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "حجم الطلب كبير جدًا." },
        { status: 413 },
      );
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذر قراءة بيانات الطلب." },
      { status: 400 },
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    // Return field-level messages only. Every message we author is Arabic, so
    // anything without Arabic text is a default Zod string — replace it rather
    // than show English copy in an Arabic UI.
    const hasArabic = /[؀-ۿ]/;
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = hasArabic.test(issue.message)
          ? issue.message
          : "هذا الحقل مطلوب";
      }
    }
    return NextResponse.json(
      { ok: false, error: "البيانات المدخلة غير صحيحة.", fieldErrors },
      { status: 400 },
    );
  }

  const order = parsed.data;

  // Honeypot: a filled hidden field means an automated submission. Respond as
  // if it succeeded so bots get no signal, but send nothing to Telegram.
  //
  // `tracked: false` tells the browser not to count this as a conversion, so
  // bot submissions never inflate ad analytics. It reveals only that an
  // analytics event was skipped — not that the order was discarded — and most
  // bots run no JavaScript and never read it at all.
  if (order.website) {
    return NextResponse.json(
      { ok: true, orderId: generateOrderId(), tracked: false },
      { status: 200 },
    );
  }

  const orderId = generateOrderId();

  try {
    await sendOrderToTelegram(order, orderId);
  } catch {
    // Details are logged inside the Telegram module; the customer sees a
    // generic message with no token, stack trace or internal detail.
    return NextResponse.json(
      { ok: false, error: "تعذر إرسال الطلب حاليًا، يرجى المحاولة مرة أخرى." },
      { status: 502 },
    );
  }

  // `tracked: true` marks this as a real order that reached Telegram — the
  // only case the client should report as a conversion.
  return NextResponse.json({ ok: true, orderId, tracked: true }, { status: 201 });
}
