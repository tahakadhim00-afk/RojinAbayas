import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { TikTokPixel } from "@/components/TikTokPixel";
import "./globals.css";

/**
 * Loaded locally so no external font provider is required and the layout does
 * not shift once the font arrives (PRD §8, §32).
 */
const thmanyah = localFont({
  src: [
    { path: "../../public/fonts/thmanyahsans-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/thmanyahsans-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/thmanyahsans-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-thmanyah",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const SITE_TITLE = "إتمام الطلب | عبايات روجين";
const SITE_DESCRIPTION =
  "أكملي معلومات طلبك من عبايات روجين وسيتم التواصل معك لتأكيد الطلب.";

export const metadata: Metadata = {
  // Absolute base for og:image. Vercel sets VERCEL_PROJECT_PRODUCTION_URL to
  // the production domain; without this the preview image would point at
  // localhost and no chat app could fetch it.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  // The tab icon comes from src/app/icon.png and apple-icon.png, which Next
  // picks up by convention. The link preview uses the wide logo instead: it
  // reads far better than the square icon in a WhatsApp or Telegram card.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ar_IQ",
    siteName: "عبايات روجين",
    images: [{ url: "/logo.png", width: 746, height: 321, alt: "عبايات روجين" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the page background, not the black logo: the browser tints its
  // chrome with this, and white keeps it continuous with the form.
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className="bg-white text-neutral-900 antialiased">
        {children}
        <TikTokPixel />
      </body>
    </html>
  );
}
