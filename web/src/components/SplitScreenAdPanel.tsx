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

const AD_ZONE = resolveZoneId(null, "PREROLL") || resolveZoneId(null, "PLAYER_BOTTOM");

export function SplitScreenAdPanel({
  visible,
  kind,
  onComplete,
  children,
}: Props) {
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

  if (!visible) return <>{children}</>;

  const ready = seconds <= 0;
  const label =
    kind === "preroll"
      ? "Anuncio · preparando reproducción"
      : "Pausa publicitaria · cada 15 min";

  return (
    <div
      className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black lg:min-h-[480px] lg:flex-row"
      role="region"
      aria-label={label}
    >
      <div className="relative min-h-[220px] flex-[3] bg-black lg:min-h-0">
        {children}
      </div>
      <aside className="flex flex-[2] flex-col border-t border-white/10 bg-[#0f0f14] lg:max-w-md lg:border-l lg:border-t-0">
        <p className="border-b border-white/5 px-4 py-2 text-xs font-medium text-brand-muted">
          {label}
        </p>
        <AdContainer
          zoneId={AD_ZONE || MONETAG_ZONES.PLAYER_BOTTOM}
          minHeight={200}
          className="mx-3 mt-3 flex-1 rounded-xl"
        />
        <div className="p-4">
          {!ready ? (
            <p className="mb-3 text-center text-3xl font-bold tabular-nums text-brand-red">
              {seconds}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!ready}
            onClick={onComplete}
            className="w-full rounded-xl bg-brand-red px-6 py-3 font-semibold text-white transition enabled:hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ready ? "Continuar viendo" : `Espera ${seconds}s`}
          </button>
        </div>
      </aside>
    </div>
  );
}
