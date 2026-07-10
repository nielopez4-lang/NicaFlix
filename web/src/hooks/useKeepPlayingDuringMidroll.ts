"use client";

import type { AdGateKind } from "@/hooks/useVideoAdTriggers";
import { useEffect } from "react";

type YtPlayer = { playVideo: () => void; getPlayerState?: () => number };

type Options = {
  gateOpen: boolean;
  gateKind: AdGateKind;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  ytPlayerRef?: React.RefObject<YtPlayer | null>;
};

/** Mid-roll estilo NBC: el programa sigue reproduciéndose en la mitad izquierda. */
export function useKeepPlayingDuringMidroll({
  gateOpen,
  gateKind,
  videoRef,
  ytPlayerRef,
}: Options) {
  useEffect(() => {
    if (!gateOpen || gateKind !== "midroll") return;

    const tick = () => {
      const video = videoRef?.current;
      if (video && video.paused) {
        void video.play().catch(() => undefined);
      }
      const yt = ytPlayerRef?.current;
      if (yt && typeof window !== "undefined" && window.YT?.PlayerState) {
        const state = yt.getPlayerState?.();
        if (state === window.YT.PlayerState.PAUSED) {
          yt.playVideo();
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 2_000);
    return () => window.clearInterval(id);
  }, [gateOpen, gateKind, videoRef, ytPlayerRef]);
}
