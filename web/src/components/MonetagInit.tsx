"use client";

import { useEffect } from "react";

/** Registra sw.js para que MultiTag funcione en HTTPS (Monetag). */
export function MonetagInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
