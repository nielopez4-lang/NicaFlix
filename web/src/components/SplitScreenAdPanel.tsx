"use client";

import AdContainer from "@/components/AdContainer";
import type { AdGateKind } from "@/hooks/useVideoAdTriggers";
import { MONETAG_ZONES, VIDEO_AD, resolveZoneId } from "@/lib/monetag-config";
import { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  kind: AdGateKind;
  onComplete: () => void;
  children: React.ReactNode;
};

const PREROLL_ZONE =
  resolveZoneId(null, "PREROLL") || resolveZoneId(null, "PLAYER_BOTTOM");
const MIDROLL_ZONE =
  resolveZoneId(null, "PLAYER_BOTTOM") || MONETAG_ZONES.PLAYER_BOTTOM;

/**
 * Pantalla dividida 50/50 — estilo NBC "Playing Through".
 * Mid-roll cada 15 min: video a la izquierda (sin pausa) + anuncio a la derecha.
 */
export function SplitScreenAdPanel({
  visible,
  kind,
  onComplete,
  children,
}: Props) {
  const [seconds, setSeconds] = useState<number>(VIDEO_AD.prerollSeconds);
  const isMidroll = kind === "midroll";

  useEffect(() => {
    if (!visible) return;
    setSeconds(
      isMidroll ? VIDEO_AD.midrollDisplaySec : VIDEO_AD.prerollSeconds,
    );
  }, [visible, kind, isMidroll]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [visible, seconds]);

  useEffect(() => {
    if (!visible || !isMidroll) return;
    const t = window.setTimeout(
      () => onComplete(),
      VIDEO_AD.midrollDisplaySec * 1000,
    );
    return () => window.clearTimeout(t);
  }, [visible, isMidroll, onComplete]);

  if (!visible) return <>{children}</>;

  const prerollReady = !isMidroll && seconds <= 0;

  if (isMidroll) {
    return (
      <div
        className="flex aspect-video w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black sm:flex-row"
        role="region"
        aria-label="Anuncio — tu programa continúa"
      >
        <div className="relative flex min-h-[200px] min-w-0 flex-1 flex-col bg-black">
          <div className="shrink-0 bg-neutral-600/95 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Tu programa continúa
          </div>
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
        <aside className="relative flex min-h-[200px] min-w-0 flex-1 flex-col border-t border-white/10 bg-black sm:border-l sm:border-t-0">
          <div className="absolute right-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/80">
            Anuncio · {seconds}s
          </div>
          <AdContainer
            zoneId={MIDROLL_ZONE}
            minHeight={280}
            slotKey="midroll-split"
            className="h-full min-h-[200px] flex-1 rounded-none border-0"
          />
          <button
            type="button"
            onClick={onComplete}
            className="absolute bottom-2 right-2 z-10 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-black/90"
          >
            Ocultar
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div
      className="flex aspect-video w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black max-sm:min-h-0 sm:flex-row"
      role="region"
      aria-label="Anuncio — preparando reproducción"
    >
      <div className="relative flex min-h-[200px] min-w-0 flex-1 bg-black max-sm:min-h-[180px]">
        {children}
      </div>
      <aside className="flex min-h-[180px] min-w-0 flex-1 flex-col border-t border-white/10 bg-[#0f0f14] sm:border-l sm:border-t-0">
        <p className="border-b border-white/5 px-3 py-2 text-xs font-medium text-brand-muted">
          Anuncio · preparando reproducción
        </p>
        <AdContainer
          zoneId={PREROLL_ZONE}
          minHeight={200}
          slotKey="preroll-split"
          className="mx-2 mt-2 flex-1 rounded-xl"
        />
        <div className="p-3">
          {!prerollReady ? (
            <p className="mb-2 text-center text-3xl font-bold tabular-nums text-brand-red">
              {seconds}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!prerollReady}
            onClick={onComplete}
            className="w-full touch-manipulation rounded-xl bg-brand-red px-6 py-3 font-semibold text-white transition enabled:hover:bg-red-600 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {prerollReady ? "Comenzar a ver" : `Espera ${seconds}s`}
          </button>
        </div>
      </aside>
    </div>
  );
}
