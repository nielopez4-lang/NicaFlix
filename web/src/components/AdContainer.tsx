"use client";

import {
  getInvokeScriptUrl,
  MONETAG_GLOBAL,
} from "@/lib/monetag-config";
import { useEffect, useRef, useState } from "react";

const injectedInvoke = new Set<string>();

function injectNativeScript(zoneId: string): void {
  if (!zoneId || injectedInvoke.has(zoneId)) return;
  injectedInvoke.add(zoneId);

  const src = getInvokeScriptUrl(zoneId);
  if (document.querySelector(`script[data-monetag-native="${zoneId}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.dataset.cfasync = "false";
  script.dataset.monetagNative = zoneId;
  document.body.appendChild(script);
}

type Props = {
  zoneId: string;
  className?: string;
  minHeight?: number;
  slotKey?: string;
  /** Primera posición en página: banner nativo inline (recomendado 1 por página). */
  preferInline?: boolean;
};

/**
 * Banner nativo Monetag.
 * - preferInline: invoke.js + container en el documento principal (recomendado 1 por página).
 * - iframe /api/ad-embed: slots adicionales aislados.
 */
export default function AdContainer({
  zoneId,
  className = "",
  minHeight = 250,
  slotKey = "",
  preferInline = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [collapsed, setCollapsed] = useState(false);

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

  useEffect(() => {
    if (!preferInline || !zoneId || !containerRef.current) return;

    containerRef.current.id = `container-${zoneId}`;
    injectNativeScript(zoneId);

    const observer = new MutationObserver(() => {
      const el = containerRef.current;
      if (el && el.children.length > 0) setCollapsed(false);
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });

    const hideTimer = window.setTimeout(() => {
      const el = containerRef.current;
      if (el && el.children.length === 0) setCollapsed(true);
    }, 12_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(hideTimer);
    };
  }, [preferInline, zoneId]);

  useEffect(() => {
    if (preferInline || !zoneId) return;

    const hideTimer = window.setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      try {
        const doc = iframe.contentDocument;
        const box = doc?.getElementById(`container-${zoneId}`);
        if (box && box.children.length === 0) setCollapsed(true);
      } catch {
        /* ignore */
      }
    }, 12_000);

    return () => window.clearTimeout(hideTimer);
  }, [preferInline, zoneId]);

  if (!zoneId || collapsed) return null;

  if (preferInline) {
    return (
      <div
        className={wrapperClass}
        style={{ minHeight }}
        data-monetag-slot={slotKey || zoneId}
        aria-label="Publicidad"
      >
        <div
          ref={containerRef}
          className="monetag-native-target flex w-full items-stretch justify-center"
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
      data-monetag-slot={slotKey || zoneId}
      aria-label="Publicidad"
    >
      <iframe
        ref={iframeRef}
        src={embedSrc}
        title="Publicidad"
        className="block w-full border-0 bg-[#0f0f14]"
        style={{ minHeight, height: minHeight }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export { AdContainer, MONETAG_GLOBAL };
