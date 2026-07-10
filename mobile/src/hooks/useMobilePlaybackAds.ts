import { useCallback, useEffect, useRef, useState } from "react";
import { VIDEO_AD } from "@/lib/monetag";

export type MobileAdKind = "preroll" | "midroll";

/** Mid-roll cada 15 min — pantalla 50/50, contenido sigue reproduciéndose. */
export function useMobilePlaybackAds(enabled = true) {
  const [started, setStarted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateKind, setGateKind] = useState<MobileAdKind>("preroll");
  const elapsedRef = useRef(0);
  const lastMidrollRef = useRef(0);

  const openGate = useCallback((kind: MobileAdKind) => {
    setGateKind(kind);
    setGateOpen(true);
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
    if (!started) {
      setStarted(true);
      lastMidrollRef.current = 0;
      elapsedRef.current = 0;
    }
  }, [started]);

  useEffect(() => {
    if (!enabled || !started) return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      if (gateOpen) return;
      const elapsed = elapsedRef.current;
      if (
        elapsed > 0 &&
        elapsed - lastMidrollRef.current >= VIDEO_AD.midrollIntervalSec
      ) {
        lastMidrollRef.current = elapsed;
        openGate("midroll");
      }
    }, 1000);
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
