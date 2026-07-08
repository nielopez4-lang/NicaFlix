"use client";

import { getInvokeScriptUrl } from "@/lib/monetag-config";
import { MONETAG_GLOBAL } from "@/lib/monetag-config";
import { useEffect, useRef } from "react";

const ZONE_ID = MONETAG_GLOBAL.zoneId;

let bannerScriptInjected = false;

function injectBannerScript(zoneId: string): void {
  if (bannerScriptInjected) return;
  if (document.querySelector(`script[data-monetag-banner="${zoneId}"]`)) {
    bannerScriptInjected = true;
    return;
  }

  bannerScriptInjected = true;
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.setAttribute("data-cfasync", "false");
  script.setAttribute("data-monetag-banner", zoneId);
  script.src = getInvokeScriptUrl(zoneId);
  script.id = `monetag-banner-script-${zoneId}`;
  document.body.appendChild(script);
}

/**
 * Banner Monetag en portada.
 * Carga invoke.js tras el paint (requestIdleCallback) para no bloquear LCP.
 */
export function AdBanner({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ZONE_ID) return;

    const loadScript = () => injectBannerScript(ZONE_ID);

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(loadScript, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(loadScript, 150);
    return () => window.clearTimeout(timerId);
  }, []);

  if (!ZONE_ID) return null;

  return (
    <div
      id="monetag-banner"
      className={`mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] ${className}`}
      style={{ minHeight: 250 }}
      data-zone-id={ZONE_ID}
      aria-label="Publicidad"
    >
      <div
        ref={containerRef}
        id={`container-${ZONE_ID}`}
        className="flex min-h-[250px] w-full items-stretch justify-center"
      />
    </div>
  );
}
