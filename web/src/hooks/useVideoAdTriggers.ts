"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VIDEO_AD,
  openDirectLink,
} from "@/lib/monetag-config";

export type AdGateKind = "preroll" | "midroll";

type Options = {
  /** Segundos de reproducción acumulados (HTML5 currentTime / YouTube getCurrentTime) */
  watchPositionRef: React.RefObject<number>;
  enabled?: boolean;
};

/**
 * Gatillos Monetag para reproductor universal (YouTube + HTML5).
 * - Pre-roll: abre Direct Link + modal; al completar inicia reproducción.
 * - Mid-roll: cada 15 min de reproducción pausa y abre Direct Link.
 */
export function useVideoAdTriggers({
  watchPositionRef,
  enabled = true,
}: Options) {
  const [started, setStarted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState<AdGateKind>("preroll");
  const [pendingStart, setPendingStart] = useState(false);
  const [pendingResume, setPendingResume] = useState(false);

  const lastMidrollAtSecRef = useRef(0);
  const linkOpenedRef = useRef(false);

  const openGate = useCallback((kind: AdGateKind) => {
    setGateKind(kind);
    setGateOpen(true);
    linkOpenedRef.current = false;
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
    linkOpenedRef.current = false;

    if (gateKind === "preroll" && !started) {
      setStarted(true);
      setPendingStart(true);
      lastMidrollAtSecRef.current = 0;
      return;
    }

    if (gateKind === "midroll") {
      setPendingResume(true);
    }
  }, [gateKind, started]);

  const consumePendingStart = useCallback(() => {
    const v = pendingStart;
    if (v) setPendingStart(false);
    return v;
  }, [pendingStart]);

  const consumePendingResume = useCallback(() => {
    const v = pendingResume;
    if (v) setPendingResume(false);
    return v;
  }, [pendingResume]);

  /** Abre Direct Link una sola vez al mostrar el modal */
  useEffect(() => {
    if (!gateOpen || linkOpenedRef.current) return;
    linkOpenedRef.current = true;
    openDirectLink();
  }, [gateOpen]);

  /** Mid-roll: temporizador ligero sobre tiempo de reproducción real */
  useEffect(() => {
    if (!enabled || !started || gateOpen) return;

    const id = window.setInterval(() => {
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
    triggerMidroll,
    pendingStart,
    pendingResume,
    consumePendingStart,
    consumePendingResume,
  };
}
