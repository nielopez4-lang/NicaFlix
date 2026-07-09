"use client";

import {
  MONETAG_DIRECT_LINK,
  buildSlotAdHtml,
  getBannerInvokeUrl,
  getBannerZoneId,
} from "@/lib/monetag";

type Props = {
  slotId: string;
  className?: string;
  minHeight?: number;
  primary?: boolean;
};

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation";

/**
 * Muestra anuncios Monetag dentro del cuadro (banner nativo invoke.js).
 */
export function MonetagNativeSlot({
  slotId,
  className = "",
  minHeight = 250,
  primary = true,
}: Props) {
  const zone = getBannerZoneId();
  const invokeUrl = getBannerInvokeUrl();
  const height = primary ? minHeight : Math.min(minHeight, 120);

  if (zone || MONETAG_DIRECT_LINK) {
    const srcDoc = buildSlotAdHtml(
      zone,
      invokeUrl,
      MONETAG_DIRECT_LINK,
      height,
    );
    return (
      <iframe
        key={slotId}
        srcDoc={srcDoc}
        title="Publicidad"
        className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] ${className}`}
        style={{ minHeight: height, height, border: 0 }}
        sandbox={IFRAME_SANDBOX}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/[0.02] ${className}`}
      style={{ minHeight: height }}
      aria-hidden
    />
  );
}
