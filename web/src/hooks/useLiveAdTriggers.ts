"use client";

import { useVideoAdTriggers } from "@/hooks/useVideoAdTriggers";
import { useEffect, useRef } from "react";

/** Anuncios en vivo: reloj de sesión + posición del video (HLS/MP4). */
export function useLiveAdTriggers(enabled = true) {
  const watchPositionRef = useRef(0);
  const triggers = useVideoAdTriggers({ watchPositionRef, enabled });
  const { started } = triggers;

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => {
      watchPositionRef.current += 1;
    }, 1000);
    return () => window.clearInterval(id);
  }, [started]);

  return { watchPositionRef, ...triggers };
}
