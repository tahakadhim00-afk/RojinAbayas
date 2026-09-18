"use client";

import { useEffect, useRef } from "react";

/** Replaces the form once the order reaches Telegram (PRD §21). */
export function SuccessState({ orderId }: { orderId: string | null }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so screen-reader users are told the form
  // was replaced rather than left on a control that no longer exists.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-6 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold text-green-900 outline-none"
      >
        تم إرسال طلبك بنجاح
      </h2>

      <p className="max-w-sm text-sm leading-relaxed text-green-800">
        شكرًا لك، تم استلام معلومات طلبك وسيتم التواصل معك لتأكيد الطلب.
      </p>

      {orderId ? (
        <p className="text-sm text-green-800">
          رقم الطلب:{" "}
          <span dir="ltr" className="font-bold tracking-wide">
            {orderId}
          </span>
        </p>
      ) : null}
    </div>
  );
}
