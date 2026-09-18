import { z } from "zod";

import {
  GOVERNORATES,
  HEIGHT_MAX_CM,
  HEIGHT_MIN_CM,
  SIZES,
  WEIGHT_MAX_KG,
  WEIGHT_MIN_KG,
} from "./constants";

/**
 * Converts Arabic-Indic (٠-٩) and Eastern Arabic (۰-۹) digits to ASCII so a
 * number typed on an Arabic keyboard validates the same as a Latin one.
 */
export function toAsciiDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/**
 * Reduces the many ways a customer may write an Iraqi mobile number to the
 * canonical local form `07XXXXXXXXX`. Accepts +964 / 00964 / 964 prefixes,
 * spaces, dashes and parentheses. Returns null when the number is not a valid
 * Iraqi mobile number.
 */
export function normalizeIraqiPhone(raw: string): string | null {
  let digits = toAsciiDigits(raw).replace(/[\s\-().]/g, "");

  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("964")) digits = digits.slice(3);
  if (!digits.startsWith("0")) digits = `0${digits}`;

  if (!/^\d+$/.test(digits)) return null;

  // Iraqi mobile numbers are 11 local digits: 07 + carrier code (3,4,5,6,7,8,9) + 8 digits.
  return /^07[3-9]\d{8}$/.test(digits) ? digits : null;
}

/** Coerces a measurement field to a number, tolerating Arabic-Indic digits. */
const measurement = (min: number, max: number, message: string) =>
  z
    .union([z.string(), z.number()], { message })
    .transform((value) =>
      typeof value === "number" ? value : Number(toAsciiDigits(value.trim())),
    )
    .refine(
      (value) => Number.isFinite(value) && value >= min && value <= max,
      { message },
    );

export const orderSchema = z.object({
  fullName: z
    .string({ message: "الاسم الكامل مطلوب" })
    .trim()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(100, "الاسم طويل جدًا"),

  phone: z
    .string({ message: "رقم الهاتف مطلوب" })
    .trim()
    .min(1, "رقم الهاتف مطلوب")
    .max(20, "رقم الهاتف طويل جدًا")
    .transform((value, ctx) => {
      const normalized = normalizeIraqiPhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "رقم الهاتف غير صحيح، مثال: 07XXXXXXXXX",
        });
        return z.NEVER;
      }
      return normalized;
    }),

  governorate: z.enum(GOVERNORATES, { message: "يرجى اختيار المحافظة" }),

  area: z
    .string({ message: "المنطقة مطلوبة" })
    .trim()
    .min(2, "المنطقة يجب أن تكون حرفين على الأقل")
    .max(150, "اسم المنطقة طويل جدًا"),

  landmark: z
    .string({ message: "أقرب نقطة دالة مطلوبة" })
    .trim()
    .min(2, "يرجى كتابة نقطة دالة واضحة")
    .max(200, "النص طويل جدًا"),

  // Kept short: these render inside a narrow one-third column on mobile, and a
  // long sentence there wraps to three lines and breaks the row's alignment.
  height: measurement(
    HEIGHT_MIN_CM,
    HEIGHT_MAX_CM,
    `${HEIGHT_MIN_CM}-${HEIGHT_MAX_CM} سم`,
  ),

  weight: measurement(
    WEIGHT_MIN_KG,
    WEIGHT_MAX_KG,
    `${WEIGHT_MIN_KG}-${WEIGHT_MAX_KG} كغم`,
  ),

  size: z.enum(SIZES, { message: "يرجى اختيار القياس" }),

  /**
   * Optional free-text note. Empty and whitespace-only values normalize to
   * undefined so the Telegram message can simply omit the section.
   */
  note: z
    .string()
    .trim()
    .max(500, "الملاحظة طويلة جدًا (500 حرف كحد أقصى)")
    .optional()
    .transform((value) => (value ? value : undefined)),

  /**
   * Honeypot: hidden from real customers, so any value means a bot (PRD §29).
   * Deliberately permissive here — the route inspects it and answers with a
   * fake success, so a bot learns nothing from the response.
   */
  website: z.string().max(200).optional(),
});

/**
 * Values as the form holds them while being filled in. The two selects start
 * empty, so their draft type widens to include `""` — that state is invalid
 * on submit but must be representable while the customer is still choosing.
 */
export type OrderFormValues = Omit<
  z.input<typeof orderSchema>,
  "governorate" | "size"
> & {
  governorate: z.input<typeof orderSchema>["governorate"] | "";
  size: z.input<typeof orderSchema>["size"] | "";
};

/** Values after validation: phone normalized, measurements numeric. */
export type Order = z.output<typeof orderSchema>;
