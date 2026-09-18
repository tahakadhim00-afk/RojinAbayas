import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

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

export const metadata: Metadata = {
  title: "إتمام الطلب | عبايات روجين",
  description: "أكملي معلومات طلبك من عبايات روجين وسيتم التواصل معك لتأكيد الطلب.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={thmanyah.variable}>
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
