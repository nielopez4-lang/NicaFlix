"use client";

import {
  MONETAG_DIRECT_LINK,
  buildNativeAdSlotHtml,
  getBannerInvokeUrl,
  getBannerZoneId,
} from "@/lib/monetag";

type Props = {
  slotId: string;
  className?: string;
  minHeight?: number;
  primary?: boolean;
};

/**
 * Banner nativo Monetag en iframe aislado (MultiTag + invoke.js).
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

  if (!zone) {
    return (
      <div
        className={`rounded-2xl border border-white/5 bg-white/[0.02] ${className}`}
        style={{ minHeight: height }}
        aria-hidden
      />
    );
  }

  const srcDoc = buildNativeAdSlotHtml(zone, height, invokeUrl);

  return (
    <iframe
      key={slotId}
      srcDoc={srcDoc}
      title="Publicidad"
      className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] ${className}`}
      style={{ minHeight: height, height, border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
