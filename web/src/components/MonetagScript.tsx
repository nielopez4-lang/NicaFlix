"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    monetag?: {
      display: (zoneId: string, elementId: string) => void;
    };
  }
}

const MONETAG_SITE_ID = process.env.NEXT_PUBLIC_MONETAG_SITE_ID;

export function MonetagScript() {
  useEffect(() => {
    if (!MONETAG_SITE_ID) return;

    const script = document.createElement("script");
    script.src = `https://cdn.monetag.com/${MONETAG_SITE_ID}.js`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
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
  useEffect(() => {
    if (!MONETAG_SITE_ID || !window.monetag) return;
    window.monetag.display(MONETAG_SITE_ID, id);
  }, [id]);

  return (
    <div
      id={id}
      className={`ad-slot ad-slot-native ${className}`}
      data-ad-zone={id}
      aria-label={label}
    >
      {!MONETAG_SITE_ID && (
        <span>
          Slot de anuncio nativo — configura <code>NEXT_PUBLIC_MONETAG_SITE_ID</code>
        </span>
      )}
    </div>
  );
}
