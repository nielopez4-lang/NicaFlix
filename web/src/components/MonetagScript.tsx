"use client";

import Script from "next/script";

const ZONE_ID = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID;

export function MonetagScript() {
  if (!ZONE_ID) return null;

  return (
    <Script
      id="monetag-multitag"
      src={`https://s.monetag.com/tag/${ZONE_ID}.js`}
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}

export function NativeAdSlot({
  id,
  label,
  className = "",
}: {
  id: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={`ad-slot ad-slot-native ${className}`}
      data-ad-zone={id}
      aria-label={label}
    >
      {!ZONE_ID && (
        <span>
          Anuncio nativo — configura{" "}
          <code>NEXT_PUBLIC_MONETAG_ZONE_ID</code> en Vercel (ver MONETAG.md)
        </span>
      )}
    </div>
  );
}
