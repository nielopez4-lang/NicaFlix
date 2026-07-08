"use client";

import {
  castStreamToTv,
  promptVideoRemotePlayback,
  shareToTv,
  youtubeWatchUrl,
} from "@/lib/cast";
import { useCallback, useState, type RefObject } from "react";

type Props = {
  titulo: string;
  streamUrl?: string;
  youtubeId?: string;
  poster?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  visible?: boolean;
  className?: string;
};

export function CastToTvButton({
  titulo,
  streamUrl,
  youtubeId,
  poster,
  videoRef,
  visible = true,
  className = "",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const showHint = useCallback((msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 5000);
  }, []);

  const handleCast = useCallback(async () => {
    setBusy(true);
    try {
      const video = videoRef?.current;

      if (video && !youtubeId) {
        const prompted = await promptVideoRemotePlayback(video);
        if (prompted) return;
      }

      if (streamUrl) {
        await castStreamToTv(streamUrl, titulo, poster);
        return;
      }

      if (youtubeId) {
        const url = youtubeWatchUrl(youtubeId);
        const result = await shareToTv(titulo, url);
        if (result === "shared") {
          showHint("Abre el enlace en la app de YouTube y toca Cast en tu TV.");
        } else {
          showHint(
            "Enlace copiado. Ábrelo en YouTube en tu TV o usa Cast desde Chrome.",
          );
        }
        return;
      }

      showHint("Este contenido no se puede enviar a la TV.");
    } catch {
      if (streamUrl) {
        try {
          await castStreamToTv(streamUrl, titulo, poster);
          return;
        } catch {
          /* fall through */
        }
      }
      if (youtubeId) {
        try {
          const result = await shareToTv(titulo, youtubeWatchUrl(youtubeId));
          showHint(
            result === "shared"
              ? "Usa Cast en la app de YouTube."
              : "Enlace copiado para abrir en tu TV.",
          );
          return;
        } catch {
          /* fall through */
        }
      }
      showHint("No se encontró un dispositivo. Usa Chrome Cast o AirPlay.");
    } finally {
      setBusy(false);
    }
  }, [videoRef, youtubeId, streamUrl, titulo, poster, showHint]);

  if (!visible || (!streamUrl && !youtubeId)) return null;

  return (
    <div className={`absolute right-3 top-3 z-20 flex flex-col items-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void handleCast()}
        disabled={busy}
        aria-label="Ver en TV"
        title="Ver en TV"
        className="flex items-center gap-2 rounded-full bg-black/75 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur transition hover:bg-black/90 disabled:opacity-60"
      >
        <TvIcon />
        <span className="hidden sm:inline">{busy ? "Conectando…" : "Ver en TV"}</span>
      </button>
      {hint ? (
        <p className="max-w-[220px] rounded-lg bg-black/85 px-3 py-2 text-right text-xs text-white/90 shadow-lg backdrop-blur">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TvIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
    </svg>
  );
}
