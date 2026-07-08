"use client";

import { VIDEO_AD } from "@/lib/monetag-config";
import type { AdGateKind } from "@/hooks/useVideoAdTriggers";
import { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  kind: AdGateKind;
  onComplete: () => void;
};

/** Modal ligero: contador 10s antes de continuar reproducción. Sin scripts pesados. */
export function VideoAdGateModal({ visible, kind, onComplete }: Props) {
  const [seconds, setSeconds] = useState<number>(VIDEO_AD.prerollSeconds);

  useEffect(() => {
    if (!visible) return;
    setSeconds(VIDEO_AD.prerollSeconds);
  }, [visible, kind]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [visible, seconds]);

  if (!visible) return null;

  const ready = seconds <= 0;
  const label =
    kind === "preroll" ? "Preparando reproducción" : "Pausa publicitaria";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-brand-card p-8 text-center shadow-2xl">
        {!ready ? (
          <p className="text-5xl font-bold tabular-nums text-brand-red">
            {seconds}
          </p>
        ) : (
          <p className="text-lg font-semibold text-white">Listo</p>
        )}

        <button
          type="button"
          disabled={!ready}
          onClick={onComplete}
          className="mt-8 w-full rounded-xl bg-brand-red px-6 py-3 font-semibold text-white transition enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ready ? "Continuar" : `${seconds}s`}
        </button>
      </div>
    </div>
  );
}

/** @deprecated Usar VideoAdGateModal */
export const AdGateOverlay = VideoAdGateModal;
