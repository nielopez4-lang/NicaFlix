"use client";

import { getInvokeScriptUrl } from "@/lib/monetag-config";
import { useEffect, useRef } from "react";

const injectedScripts = new Set();

function injectMonetagScript(zoneId) {
  const src = getInvokeScriptUrl(zoneId);
  if (injectedScripts.has(src)) return;
  injectedScripts.add(src);
  if (document.querySelector(`script[data-monetag-zone="${zoneId}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.setAttribute("data-monetag-zone", zoneId);
  script.src = src;
  script.id = `monetag-invoke-${zoneId}`;
  document.body.appendChild(script);
}

const IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation";

/**
 * Banner Container Monetag (In-Page Push / Native Banner).
 * Por defecto usa iframe embebido para que cada cuadro renderice su anuncio
 * sin conflictos de `container-{zoneId}` en la misma página.
 *
 * @param {{ zoneId: string, className?: string, minHeight?: number, inline?: boolean }} props
 */
export default function AdContainer({
  zoneId,
  className = "",
  minHeight = 250,
  inline = false,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!zoneId || !inline) return;
    injectMonetagScript(zoneId);
  }, [zoneId, inline]);

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

  if (!zoneId) {
    return (
      <div
        className={`ad-slot ad-slot-native ${className}`}
        style={{ minHeight }}
        aria-hidden
      />
    );
  }

  if (inline) {
    return (
      <div
        className={wrapperClass}
        style={{ minHeight }}
        data-monetag-slot={zoneId}
      >
        <div
          ref={containerRef}
          id={`container-${zoneId}`}
          className="monetag-banner-target flex w-full items-stretch justify-center"
          style={{ minHeight }}
        />
      </div>
    );
  }

  const embedSrc = `/api/ad-embed?zone=${encodeURIComponent(zoneId)}&h=${minHeight}`;

  return (
    <div
      className={wrapperClass}
      style={{ minHeight }}
      data-monetag-slot={zoneId}
    >
      <iframe
        src={embedSrc}
        title="Anuncio"
        className="block w-full border-0 bg-[#0f0f14]"
        style={{ minHeight, height: minHeight }}
        loading="lazy"
        sandbox={IFRAME_SANDBOX}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export { AdContainer };
