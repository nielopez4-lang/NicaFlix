"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VIDEO_AD,
} from "@/lib/monetag-config";

export type AdGateKind = "preroll" | "midroll";

type Options = {
  /** Segundos de reproducción acumulados (HTML5 currentTime / YouTube getCurrentTime) */
  watchPositionRef: React.RefObject<number>;
  enabled?: boolean;
};

/**
 * Gatillos Monetag para reproductor universal (YouTube + HTML5).
 * - Pre-roll: pantalla dividida; al completar inicia reproducción.
 * - Mid-roll: cada 10 min, pantalla 50/50 — anuncio + programa sin pausar.
 */
export function useVideoAdTriggers({
  watchPositionRef,
  enabled = true,
}: Options) {
  const [started, setStarted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState<AdGateKind>("preroll");
  const [pendingStart, setPendingStart] = useState(false);

  const lastMidrollAtSecRef = useRef(0);
  const gateKindRef = useRef(gateKind);
  const startedRef = useRef(started);

  gateKindRef.current = gateKind;
  startedRef.current = started;

  const openGate = useCallback((kind: AdGateKind) => {
    setGateKind(kind);
    setGateOpen(true);
  }, []);

  const requestPreroll = useCallback(() => {
    if (!enabled) {
      setStarted(true);
      setPendingStart(true);
      return;
    }
    openGate("preroll");
  }, [enabled, openGate]);

  const triggerMidroll = useCallback(() => {
    if (!enabled || !started) return;
    lastMidrollAtSecRef.current = watchPositionRef.current ?? 0;
    openGate("midroll");
  }, [enabled, started, openGate, watchPositionRef]);

  const completeGate = useCallback(() => {
    setGateOpen(false);

    if (gateKindRef.current === "preroll" && !startedRef.current) {
      setStarted(true);
      setPendingStart(true);
      lastMidrollAtSecRef.current = 0;
    }
  }, []);

  const consumePendingStart = useCallback(() => {
    const v = pendingStart;
    if (v) setPendingStart(false);
    return v;
  }, [pendingStart]);

  /** @deprecated Usar requestPreroll — mismo flujo que películas (sin salir de la app). */
  const startLivePlayback = useCallback(() => {
    requestPreroll();
  }, [requestPreroll]);

  /** Mid-roll cada 10 min — video sigue en la mitad izquierda */
  useEffect(() => {
    if (!enabled || !started) return;

    const id = window.setInterval(() => {
      if (gateOpen) return;
      const pos = watchPositionRef.current ?? 0;
      if (
        pos > 0 &&
        pos - lastMidrollAtSecRef.current >= VIDEO_AD.midrollIntervalSec
      ) {
        triggerMidroll();
      }
    }, VIDEO_AD.midrollCheckMs);

    return () => window.clearInterval(id);
  }, [enabled, started, gateOpen, triggerMidroll, watchPositionRef]);

  return {
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    startLivePlayback,
    triggerMidroll,
    pendingStart,
    consumePendingStart,
  };
}
