"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { GOVERNORATES, SIZE_MAX_LENGTH } from "@/lib/constants";
import { orderSchema, type Order, type OrderFormValues } from "@/lib/schema";
import {
  createEventId,
  tiktokIdentify,
  tiktokTrack,
  toE164Iraqi,
} from "@/lib/tiktok";
import { Field, controlClasses } from "./Field";
import { SuccessState } from "./SuccessState";

type Status = "idle" | "submitting" | "error";

/** Shared across the TikTok events so they report as one funnel. */
const TIKTOK_CONTENT = {
  content_type: "product",
  content_id: "rojin-abaya-order",
} as const;

export function OrderForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  /** Synchronous in-flight flag; see the guard in `submitOrder`. */
  const inFlightRef = useRef(false);
  /**
   * Fire-once guards for the analytics events. Refs survive React StrictMode's
   * double-invoked effects in development, so events are not counted twice.
   */
  const viewTrackedRef = useRef(false);
  const startTrackedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OrderFormValues, unknown, Order>({
    resolver: standardSchemaResolver(orderSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      governorate: "",
      area: "",
      landmark: "",
      height: "",
      weight: "",
      size: "",
      note: "",
      website: "",
    },
  });

  const isSubmitting = status === "submitting";

  // Move focus to the error summary once it renders, so the failure is
  // announced rather than left silently above the button.
  useEffect(() => {
    if (status === "error") errorRef.current?.focus();
  }, [status, errorMessage]);

  // The customer reached the order form. Fired here rather than in the layout
  // so it means "saw the form", not merely "loaded some page".
  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    tiktokTrack("ViewContent", {
      event_id: createEventId(),
      ...TIKTOK_CONTENT,
      content_name: "إتمام الطلب",
    });
  }, []);

  /** Re-arms the form when validation fails, so the customer can correct and retry. */
  const releaseGuard = useCallback(() => {
    inFlightRef.current = false;
  }, []);

  /**
   * The customer started filling the form, rather than just landing on it.
   * Delegated from the form element so no field's `register()` spread has to
   * be touched.
   */
  const handleFormStart = useCallback(() => {
    if (startTrackedRef.current) return;
    startTrackedRef.current = true;
    tiktokTrack("ClickButton", {
      event_id: createEventId(),
      ...TIKTOK_CONTENT,
      content_name: "بدء تعبئة النموذج",
    });
  }, []);

  const submitOrder = useCallback(async (values: Order) => {
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            orderId?: string;
            tracked?: boolean;
            error?: string;
            fieldErrors?: Record<string, string>;
          }
        | null;

      if (response.ok && data?.ok) {
        // Report the conversion only for orders that actually reached Telegram.
        // The honeypot answers bots with a fake success (200 + tracked:false),
        // so both checks must pass before anything is counted.
        if (response.status === 201 && data.tracked === true) {
          // Plaintext by design: the pixel hashes these with SHA-256 in the
          // browser, so nothing identifying leaves the device in the clear.
          tiktokIdentify({
            phone_number: toE164Iraqi(values.phone),
            external_id: data.orderId,
          });

          // The order id doubles as the event id, so a repeated fire for the
          // same order collapses into one conversion on TikTok's side.
          tiktokTrack("SubmitForm", {
            event_id: data.orderId ?? createEventId(),
            ...TIKTOK_CONTENT,
            content_name: "طلب عباية",
          });
        }

        setOrderId(data.orderId ?? null);
        return;
      }

      // Surface server-side field errors on the matching inputs so the
      // customer's entered information is preserved (PRD §22).
      if (data?.fieldErrors) {
        for (const [field, message] of Object.entries(data.fieldErrors)) {
          setError(field as keyof OrderFormValues, { type: "server", message });
        }
      }

      setErrorMessage(
        data?.error ?? "تعذر إرسال الطلب حاليًا، يرجى المحاولة مرة أخرى.",
      );
      setStatus("error");
      // Released only on failure — after a success the form is replaced by the
      // confirmation, so the order can never be sent twice.
      inFlightRef.current = false;
    } catch {
      setErrorMessage(
        "تعذر الاتصال بالخادم، يرجى التحقق من الاتصال والمحاولة مرة أخرى.",
      );
      setStatus("error");
      inFlightRef.current = false;
    }
  }, [setError]);

  if (orderId) {
    return <SuccessState orderId={orderId} />;
  }

  return (
    <form
      // Catches the first focus of any field in one place, so every field's
      // react-hook-form wiring stays untouched.
      onFocusCapture={handleFormStart}
      onSubmit={(event) => {
        // Claimed here, before validation, not inside the validated callback:
        // handleSubmit validates asynchronously, so a second click would
        // otherwise clear the guard and fire a duplicate request (PRD §42).
        if (inFlightRef.current) {
          event.preventDefault();
          return;
        }
        inFlightRef.current = true;
        void handleSubmit(submitOrder, releaseGuard)(event);
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <Field id="fullName" label="الاسم الكامل" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          maxLength={100}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={controlClasses(Boolean(errors.fullName))}
          {...register("fullName")}
        />
      </Field>

      <Field id="phone" label="رقم الهاتف" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          // Digits read correctly left-to-right even inside the RTL page (PRD §40).
          dir="ltr"
          className={`${controlClasses(Boolean(errors.phone))} text-right`}
          {...register("phone")}
        />
      </Field>

      <Field
        id="governorate"
        label="المحافظة"
        error={errors.governorate?.message}
      >
        <select
          id="governorate"
          disabled={isSubmitting}
          defaultValue=""
          aria-invalid={Boolean(errors.governorate)}
          aria-describedby={errors.governorate ? "governorate-error" : undefined}
          className={controlClasses(Boolean(errors.governorate))}
          {...register("governorate")}
        >
          <option value="" disabled>
            اختاري المحافظة
          </option>
          {GOVERNORATES.map((governorate) => (
            <option key={governorate} value={governorate}>
              {governorate}
            </option>
          ))}
        </select>
      </Field>

      <Field id="area" label="المنطقة" error={errors.area?.message}>
        <input
          id="area"
          type="text"
          maxLength={150}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.area)}
          aria-describedby={errors.area ? "area-error" : undefined}
          className={controlClasses(Boolean(errors.area))}
          {...register("area")}
        />
      </Field>

      <Field
        id="landmark"
        label="أقرب نقطة دالة"
        error={errors.landmark?.message}
      >
        <input
          id="landmark"
          type="text"
          maxLength={200}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.landmark)}
          aria-describedby={
            errors.landmark ? "landmark-error" : "landmark-help"
          }
          className={controlClasses(Boolean(errors.landmark))}
          {...register("landmark")}
        />
        {!errors.landmark ? (
          <p id="landmark-help" className="text-xs text-neutral-500">
            اذكري نقطة معروفة تساعد المندوب في الوصول إليك.
          </p>
        ) : null}
      </Field>

      {/* Height, weight and size share one row wherever the width allows (PRD §15). */}
      <div className="grid grid-cols-3 gap-3">
        <Field
          id="height"
          label="الطول"
          hint="سم"
          error={errors.height?.message}
        >
          <input
            id="height"
            type="number"
            inputMode="numeric"
            min={100}
            max={230}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.height)}
            aria-describedby={errors.height ? "height-error" : undefined}
            className={controlClasses(Boolean(errors.height))}
            {...register("height")}
          />
        </Field>

        <Field
          id="weight"
          label="الوزن"
          hint="كغم"
          error={errors.weight?.message}
        >
          <input
            id="weight"
            type="number"
            inputMode="numeric"
            min={20}
            max={250}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.weight)}
            aria-describedby={errors.weight ? "weight-error" : undefined}
            className={controlClasses(Boolean(errors.weight))}
            {...register("weight")}
          />
        </Field>

        <Field id="size" label="القياس" error={errors.size?.message}>
          <input
            id="size"
            type="text"
            // Letters and brand numbers are both valid, so this stays free text.
            maxLength={SIZE_MAX_LENGTH}
            autoComplete="off"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.size)}
            aria-describedby={errors.size ? "size-error" : undefined}
            className={controlClasses(Boolean(errors.size))}
            {...register("size")}
          />
        </Field>
      </div>

      <Field
        id="note"
        label="ملاحظة"
        hint="اختياري"
        error={errors.note?.message}
      >
        <textarea
          id="note"
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? "note-error" : undefined}
          className={`${controlClasses(Boolean(errors.note))} resize-y`}
          {...register("note")}
        />
      </Field>

      {/* Honeypot: off-screen and hidden from assistive tech, so only bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">الموقع الإلكتروني</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {status === "error" && errorMessage ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-right outline-none"
        >
          <p className="font-medium text-red-800">تعذر إرسال الطلب</p>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={[
          "mt-1 w-full rounded-lg bg-neutral-900 px-4 py-3.5 text-base font-medium text-white",
          "transition-colors hover:bg-neutral-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-neutral-400",
        ].join(" ")}
      >
        {isSubmitting ? "جارٍ إرسال الطلب..." : "إتمام الطلب"}
      </button>

      {/* "فقط" was dropped: a hashed phone now also goes to our advertising
          measurement tools, which is a second purpose the old wording denied. */}
      <p className="text-center text-xs leading-relaxed text-neutral-500">
        معلوماتك تُستخدم لمعالجة طلبك، وسيتم التواصل معك على الواتساب لتأكيد
        الطلب. نستخدم أدوات قياس لتحسين إعلاناتنا دون مشاركة معلوماتك بصيغتها
        الظاهرة.
      </p>
    </form>
  );
}
