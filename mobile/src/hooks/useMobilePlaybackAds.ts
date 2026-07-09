import { useCallback, useEffect, useRef, useState } from "react";
import { VIDEO_AD, openDirectLink } from "@/lib/monetag";

export type MobileAdKind = "preroll" | "midroll";

export function useMobilePlaybackAds(enabled = true) {
  const [started, setStarted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState<MobileAdKind>("preroll");
  const elapsedRef = useRef(0);
  const lastMidrollRef = useRef(0);
  const linkOpenedRef = useRef(false);

  const openGate = useCallback((kind: MobileAdKind) => {
    setGateKind(kind);
    setGateOpen(true);
    linkOpenedRef.current = false;
  }, []);

  const requestPreroll = useCallback(() => {
    if (!enabled) {
      setStarted(true);
      return;
    }
    openGate("preroll");
  }, [enabled, openGate]);

  const completeGate = useCallback(() => {
    setGateOpen(false);
    linkOpenedRef.current = false;
    if (!started) {
      setStarted(true);
      lastMidrollRef.current = 0;
      elapsedRef.current = 0;
    }
  }, [started]);

  useEffect(() => {
    if (!gateOpen || linkOpenedRef.current) return;
    linkOpenedRef.current = true;
    openDirectLink();
  }, [gateOpen]);

  useEffect(() => {
    if (!enabled || !started || gateOpen) return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      const elapsed = elapsedRef.current;
      const intervalSec = VIDEO_AD.midrollIntervalMs / 1000;
      if (elapsed > 0 && elapsed - lastMidrollRef.current >= intervalSec) {
        lastMidrollRef.current = elapsed;
        openGate("midroll");
      }
    }, 20_000);
    return () => clearInterval(id);
  }, [enabled, started, gateOpen, openGate]);

  return {
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
  };
}
