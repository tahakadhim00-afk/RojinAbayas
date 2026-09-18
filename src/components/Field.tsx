import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  /** Short unit or clarifying note shown beside the label, e.g. "سم". */
  hint?: string;
  error?: string;
  children: ReactNode;
};

/**
 * Wraps a control with its visible label and error message, wiring the ids
 * that `aria-describedby` on the control points at.
 */
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
        {hint ? (
          <span className="mr-1 font-normal text-neutral-500">({hint})</span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control styling: 44px+ touch target, visible focus, error state. */
export function controlClasses(hasError: boolean): string {
  return [
    "w-full rounded-lg border bg-white px-3 py-2.5 text-base text-neutral-900",
    "placeholder:text-neutral-400",
    "outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-offset-1",
    hasError
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/40"
      : "border-neutral-200 focus-visible:border-neutral-900 focus-visible:ring-neutral-900/20",
    "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
  ].join(" ");
}
