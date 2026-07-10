"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useKeepPlayingDuringMidroll } from "@/hooks/useKeepPlayingDuringMidroll";
import { useVideoAdTriggers } from "@/hooks/useVideoAdTriggers";
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
  const [playerError, setPlayerError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  /** iOS/Android: iframe YouTube en el mismo gesto del usuario (autoplay permitido). */
  const [mobileEmbedSrc, setMobileEmbedSrc] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YtPlayer | null>(null);
  const ytPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    consumePendingStart,
    startLivePlayback,
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

  const mountYouTubePlayer = useCallback(async () => {
    if (!youtubeId || !ytContainerRef.current) return false;
    setPlayerError(false);
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
            setPlayerError(true);
            setPlayerReady(false);
          },
        },
      });
      return true;
    } catch {
      setPlayerError(true);
      return false;
    }
  }, [youtubeId, startYtPositionPoll]);

  const startHtml5Playback = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return false;
    try {
      v.playsInline = true;
      await v.play();
      setPlayerReady(true);
      return true;
    } catch {
      setPlayerError(true);
      return false;
    }
  }, []);

  const startPlayback = useCallback(async () => {
    if (mobileEmbedSrc) {
      setPlayerReady(true);
      return true;
    }
    if (youtubeId) return mountYouTubePlayer();
    return startHtml5Playback();
  }, [youtubeId, mobileEmbedSrc, mountYouTubePlayer, startHtml5Playback]);

  const handlePlayTap = useCallback(() => {
    setPlayerError(false);

    if (isMobile) {
      startLivePlayback();
      if (youtubeId) {
        setMobileEmbedSrc(youtubeEmbedUrl(youtubeId, true));
        setPlayerReady(true);
        return;
      }
      void startHtml5Playback();
      return;
    }

    requestPreroll();
  }, [isMobile, youtubeId, startLivePlayback, requestPreroll, startHtml5Playback]);

  useEffect(() => {
    if (!started) return;
    if (gateOpen && gateKind === "preroll") return;
    if (mobileEmbedSrc) return;
    if (consumePendingStart()) void startPlayback();
  }, [
    started,
    gateOpen,
    gateKind,
    consumePendingStart,
    startPlayback,
    mobileEmbedSrc,
  ]);

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

  const showMobileIframe = started && youtubeId && mobileEmbedSrc;

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
        ) : showMobileIframe ? (
          <iframe
            title={titulo}
            src={mobileEmbedSrc}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : youtubeId ? (
          <>
            <div ref={ytContainerRef} className="h-full w-full" title={titulo} />
            {!playerReady && !playerError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
              </div>
            )}
            {playerError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/90 px-4 text-center">
                <p className="text-sm text-brand-muted">
                  No se pudo reproducir en YouTube. Prueba de nuevo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlayerError(false);
                    if (isMobile && youtubeId) {
                      setMobileEmbedSrc(youtubeEmbedUrl(youtubeId, true));
                      setPlayerReady(true);
                    } else {
                      void startPlayback();
                    }
                  }}
                  className="touch-manipulation rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
                >
                  Reintentar
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              disableRemotePlayback={false}
              x-webkit-airplay="allow"
              className="h-full w-full"
              src={streamUrl}
              title={titulo}
              onTimeUpdate={onVideoTimeUpdate}
              onError={() => setPlayerError(true)}
              onCanPlay={() => setPlayerReady(true)}
            />
            {playerError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/90 px-4 text-center">
                <p className="text-sm text-brand-muted">
                  Error al cargar el video. Comprueba tu conexión e intenta de nuevo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlayerError(false);
                    void startHtml5Playback();
                  }}
                  className="touch-manipulation rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
                >
                  Reintentar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SplitScreenAdPanel>
  );
}
