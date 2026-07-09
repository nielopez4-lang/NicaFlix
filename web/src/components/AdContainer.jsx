"use client";

import {
  DIRECT_LINK_URL,
  buildSlotAdHtml,
  getInvokeScriptUrl,
} from "@/lib/monetag-config";
import { useMemo } from "react";

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation allow-modals";

/**
 * Cuadro de anuncio Monetag.
 * Carga banner nativo (invoke.js) y Direct Link en el mismo espacio para evitar cajas vacías.
 *
 * @param {{ zoneId: string, className?: string, minHeight?: number, slotKey?: string }} props
 */
export default function AdContainer({
  zoneId,
  className = "",
  minHeight = 250,
  slotKey = "",
}) {
  const srcDoc = useMemo(() => {
    if (!zoneId) return "";
    const invokeUrl = getInvokeScriptUrl(zoneId);
    return buildSlotAdHtml(zoneId, invokeUrl, DIRECT_LINK_URL, minHeight);
  }, [zoneId, minHeight]);

  const wrapperClass = [
    "ad-container",
    "ad-slot-native",
    "overflow-hidden",
    "rounded-2xl",
    "border border-white/10",
    "bg-[#0f0f14]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!zoneId || !srcDoc) {
    return (
      <div
        className={`ad-slot ad-slot-native ${className}`}
        style={{ minHeight }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={wrapperClass}
      style={{ minHeight }}
      data-monetag-slot={slotKey || zoneId}
      aria-label="Publicidad"
    >
      <iframe
        srcDoc={srcDoc}
        title="Publicidad"
        className="block w-full border-0 bg-[#0f0f14]"
        style={{ minHeight, height: minHeight }}
        sandbox={IFRAME_SANDBOX}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export { AdContainer };
