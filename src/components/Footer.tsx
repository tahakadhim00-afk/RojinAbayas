/**
 * Store contact links. Handles are shown LTR so Arabic RTL layout does not
 * reorder the latin usernames or the phone number.
 */

const INSTAGRAM_HANDLE = "rojin.abaya";
const TIKTOK_HANDLE = "rojin__abaya";
/** Display form; the wa.me link needs digits only (see WHATSAPP_DIGITS). */
const WHATSAPP_DISPLAY = "+964 788 770 0111";
const WHATSAPP_DIGITS = "9647887700111";

const iconClasses = "h-5 w-5 shrink-0";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClasses} fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Z" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClasses} fill="currentColor">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.7a5.68 5.68 0 0 0-.77-.05A5.66 5.66 0 1 0 15.54 15.3V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClasses} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      <path d="M20.52 3.45A11.87 11.87 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.94L.07 24l6.34-1.66a11.83 11.83 0 0 0 5.64 1.44h.01c6.54 0 11.87-5.33 11.87-11.88 0-3.17-1.23-6.15-3.47-8.4l.06-.05ZM12.06 21.79h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.12 1.03 6.98 2.9a9.81 9.81 0 0 1 2.89 6.98c0 5.45-4.43 9.88-9.87 9.88Z" />
    </svg>
  );
}

/** One contact row: icon, platform name, and the handle in LTR. */
function ContactLink({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // min-h-11 (44px) keeps the tap target comfortable on a phone.
      className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <span dir="ltr" className="mr-auto text-sm text-neutral-500">
        {value}
      </span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-200 pt-6">
      <p className="mb-2 text-center text-sm text-neutral-500">
        تابعينا أو تواصلي معنا
      </p>

      <nav aria-label="روابط التواصل" className="flex flex-col gap-0.5">
        <ContactLink
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          icon={<InstagramIcon />}
          label="انستغرام"
          value={`@${INSTAGRAM_HANDLE}`}
        />
        <ContactLink
          href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
          icon={<TikTokIcon />}
          label="تيك توك"
          value={`@${TIKTOK_HANDLE}`}
        />
        <ContactLink
          // wa.me requires digits only — no "+", spaces or dashes.
          href={`https://wa.me/${WHATSAPP_DIGITS}`}
          icon={<WhatsAppIcon />}
          label="واتساب"
          value={WHATSAPP_DISPLAY}
        />
      </nav>

      <p className="mt-5 text-center text-xs text-neutral-400">
        عبايات روجين
      </p>
    </footer>
  );
}
