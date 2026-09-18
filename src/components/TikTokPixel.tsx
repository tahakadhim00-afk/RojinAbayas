import Script from "next/script";

import { TIKTOK_PIXEL_ID } from "@/lib/tiktok";

/**
 * Loads the TikTok Pixel base snippet.
 *
 * Renders nothing when NEXT_PUBLIC_TIKTOK_PIXEL_ID is unset, so local
 * development and preview deployments never report into production data.
 *
 * `afterInteractive` is deliberate: `beforeInteractive` would block first paint
 * on a third-party request, and `lazyOnload` waits for window.onload, which on
 * a slow mobile connection can land after the customer has started typing.
 */
export function TikTokPixel() {
  if (!TIKTOK_PIXEL_ID) return null;

  // The pixel id is validated at the module boundary below rather than
  // interpolated blindly: it ends up inside a JS string literal, so anything
  // exotic in the env var would break the snippet.
  const safeId = TIKTOK_PIXEL_ID.replace(/[^A-Za-z0-9_-]/g, "");
  if (!safeId) return null;

  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${safeId}');
  ttq.page();
}(window, document, 'ttq');`}
    </Script>
  );
}
