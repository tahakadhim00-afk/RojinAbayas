/**
 * Customer-rights notice shown above the form (PRD §41: "no surprises").
 * Placed before the fields so the customer reads it before investing effort.
 */
export function ImportantNotice() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
      {/* Inline SVG rather than a text "!" so it renders identically on every
          device and stays aligned with the first line of text. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <div>
        <p className="text-sm font-bold text-amber-900">ملاحظة مهمة</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900/85">
          يحق للزبون فحص الطلب بوجود المندوب، وعند وجود أي خلل يُسترجع الطلب
          بدون دفع أي أجور للمندوب.
        </p>
      </div>
    </div>
  );
}
