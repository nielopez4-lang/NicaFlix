"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useKeepPlayingDuringMidroll } from "@/hooks/useKeepPlayingDuringMidroll";
import { useVideoAdTriggers } from "@/hooks/useVideoAdTriggers";
import { youtubeWatchUrl } from "@/lib/cast";
import {
  isMobileDevice,
  youtubeEmbedUrl,
} from "@/lib/device";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  streamUrl?: string;
  youtubeId?: string;
  titulo: string;
  portada?: string;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YtPlayer }) => void;
            onStateChange?: (e: { data: number; target: YtPlayer }) => void;
            onError?: (e: { data: number }) => void;
          };
        },
      ) => YtPlayer;
      PlayerState: { PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  destroy: () => void;
};

type YoutubePlayback = "idle" | "api" | "iframe" | "failed";

const YT_API_TIMEOUT_MS = 10_000;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      done();
    };
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const poll = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(poll);
          done();
        }
      }, 200);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  });
}

export function MonetizedVideoPlayer({
  streamUrl,
  youtubeId,
  titulo,
  portada,
}: Props) {
  const watchPositionRef = useRef(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [youtubePlayback, setYoutubePlayback] =
    useState<YoutubePlayback>("idle");
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [html5Error, setHtml5Error] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YtPlayer | null>(null);
  const ytPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackTriggeredRef = useRef(false);

  const {
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    consumePendingStart,
  } = useVideoAdTriggers({ watchPositionRef });

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useKeepPlayingDuringMidroll({
    gateOpen,
    gateKind,
    videoRef,
    ytPlayerRef,
  });

  const clearYtPoll = useCallback(() => {
    if (ytPollRef.current) {
      clearInterval(ytPollRef.current);
      ytPollRef.current = null;
    }
  }, []);

  const startYtPositionPoll = useCallback(() => {
    clearYtPoll();
    ytPollRef.current = setInterval(() => {
      const t = ytPlayerRef.current?.getCurrentTime();
      if (typeof t === "number") watchPositionRef.current = t;
    }, 5000);
  }, [clearYtPoll]);

  const startYoutubeIframe = useCallback(() => {
    if (!youtubeId) return;
    fallbackTriggeredRef.current = true;
    ytPlayerRef.current?.destroy();
    ytPlayerRef.current = null;
    clearYtPoll();
    setYoutubePlayback("iframe");
    setIframeSrc(youtubeEmbedUrl(youtubeId, true));
    setPlayerReady(true);
  }, [youtubeId, clearYtPoll]);

  const markYoutubeFailed = useCallback(() => {
    setYoutubePlayback("failed");
    setPlayerReady(false);
  }, []);

  const mountYouTubePlayer = useCallback(async () => {
    if (!youtubeId || !ytContainerRef.current) return false;
    setYoutubePlayback("api");
    try {
      await loadYouTubeApi();
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = new window.YT!.Player(ytContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            setPlayerReady(true);
            startYtPositionPoll();
          },
          onStateChange: (e) => {
            if (e.data === window.YT!.PlayerState.PLAYING) {
              setPlayerReady(true);
              startYtPositionPoll();
            }
          },
          onError: () => {
            if (!fallbackTriggeredRef.current) startYoutubeIframe();
            else markYoutubeFailed();
          },
        },
      });
      return true;
    } catch {
      if (!fallbackTriggeredRef.current) startYoutubeIframe();
      else markYoutubeFailed();
      return false;
    }
  }, [
    youtubeId,
    startYtPositionPoll,
    startYoutubeIframe,
    markYoutubeFailed,
  ]);

  const startHtml5Playback = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return false;
    try {
      v.playsInline = true;
      await v.play();
      setPlayerReady(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const beginPlayback = useCallback(async () => {
    fallbackTriggeredRef.current = false;
    setPlayerReady(false);
    setHtml5Error(false);

    if (youtubeId) {
      if (isMobile) {
        startYoutubeIframe();
        return;
      }
      await mountYouTubePlayer();
      return;
    }

    await startHtml5Playback();
  }, [youtubeId, isMobile, startYoutubeIframe, mountYouTubePlayer, startHtml5Playback]);

  const handlePlayTap = useCallback(() => {
    setYoutubePlayback("idle");
    setIframeSrc(null);
    requestPreroll();
  }, [requestPreroll]);

  useEffect(() => {
    if (!started) return;
    if (gateOpen && gateKind === "preroll") return;
    if (consumePendingStart()) void beginPlayback();
  }, [started, gateOpen, gateKind, consumePendingStart, beginPlayback]);

  useEffect(() => {
    if (
      !started ||
      youtubePlayback !== "api" ||
      playerReady ||
      fallbackTriggeredRef.current
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      if (!playerReady && !fallbackTriggeredRef.current) {
        startYoutubeIframe();
      }
    }, YT_API_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [started, youtubePlayback, playerReady, startYoutubeIframe]);

  useEffect(
    () => () => {
      clearYtPoll();
      ytPlayerRef.current?.destroy();
    },
    [clearYtPoll],
  );

  const onVideoTimeUpdate = () => {
    const v = videoRef.current;
    if (v && !v.paused) watchPositionRef.current = v.currentTime;
  };

  if (!youtubeId && !streamUrl) {
    return (
      <p className="rounded-xl bg-brand-card p-8 text-center text-brand-muted">
        Reproductor no disponible para este título.
      </p>
    );
  }

  const thumb =
    portada ??
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined);

  const showYoutubeIframe =
    started && youtubeId && youtubePlayback === "iframe" && iframeSrc;
  const showYoutubeFailed = started && youtubeId && youtubePlayback === "failed";
  const showYoutubeApi =
    started && youtubeId && youtubePlayback === "api" && !showYoutubeIframe;
  const showHtml5 = started && !youtubeId && streamUrl;

  return (
    <SplitScreenAdPanel
      visible={gateOpen}
      kind={gateKind}
      onComplete={completeGate}
    >
      <div className="relative aspect-video w-full min-h-[220px] overflow-hidden bg-black">
        <CastToTvButton
          titulo={titulo}
          streamUrl={streamUrl}
          youtubeId={youtubeId}
          poster={thumb}
          videoRef={videoRef}
          visible={started}
        />
        {!started ? (
          <button
            type="button"
            onClick={handlePlayTap}
            className="group relative z-10 flex min-h-[220px] w-full touch-manipulation items-center justify-center active:opacity-90"
            aria-label={`Reproducir ${titulo}`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
              />
            ) : null}
            <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-red text-3xl shadow-lg transition group-active:scale-95">
              ▶
            </span>
            <span className="absolute bottom-4 left-0 right-0 text-center text-xs font-medium text-white/80">
              Toca para reproducir
            </span>
          </button>
        ) : showYoutubeIframe ? (
          <iframe
            title={titulo}
            src={iframeSrc!}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : showYoutubeApi ? (
          <>
            <div
              ref={ytContainerRef}
              className="absolute inset-0 h-full w-full"
              title={titulo}
            />
            {!playerReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
              </div>
            )}
          </>
        ) : showYoutubeFailed && youtubeId ? (
          <YoutubeErrorOverlay youtubeId={youtubeId} onRetry={beginPlayback} />
        ) : showHtml5 ? (
          <>
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              disableRemotePlayback={false}
              x-webkit-airplay="allow"
              className="absolute inset-0 h-full w-full"
              src={streamUrl}
              title={titulo}
              onTimeUpdate={onVideoTimeUpdate}
              onPlaying={() => setPlayerReady(true)}
              onCanPlay={() => setPlayerReady(true)}
              onError={() => setHtml5Error(true)}
            />
            {html5Error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 px-4 text-center">
                <p className="text-sm text-brand-muted">
                  Error al cargar el video. Comprueba tu conexión.
                </p>
                <button
                  type="button"
                  onClick={() => void beginPlayback()}
                  className="touch-manipulation rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
                >
                  Reintentar
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </SplitScreenAdPanel>
  );
}

function YoutubeErrorOverlay({
  youtubeId,
  onRetry,
}: {
  youtubeId: string;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 px-4 text-center">
      <p className="text-sm text-brand-muted">
        No se pudo reproducir aquí. Puede estar bloqueada en tu región.
      </p>
      <a
        href={youtubeWatchUrl(youtubeId)}
        target="_blank"
        rel="noopener noreferrer"
        className="touch-manipulation rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
      >
        Abrir en YouTube
      </a>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="touch-manipulation rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
      >
        Reintentar
      </button>
    </div>
  );
}
