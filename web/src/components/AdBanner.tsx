"use client";

import AdContainer from "@/components/AdContainer";
import { MONETAG_ZONES } from "@/lib/monetag-config";

/** Banner superior — nativo inline (mejor compatibilidad Monetag). */
export function AdBanner({ className = "" }: { className?: string }) {
  return (
    <AdContainer
      zoneId={MONETAG_ZONES.HOME_TOP}
      slotKey="HOME_TOP"
      className={`mx-auto w-full max-w-6xl ${className}`.trim()}
      minHeight={250}
      preferInline
    />
  );
}
