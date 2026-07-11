"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { PlayerErrorBoundary } from "@/components/PlayerErrorBoundary";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useKeepPlayingDuringMidroll } from "@/hooks/useKeepPlayingDuringMidroll";
import { useLiveAdTriggers } from "@/hooks/useLiveAdTriggers";
import { attachLiveHls } from "@/lib/hls-player";
import {
  isDailyMotionStreamUrl,
  isKnownEmbedUrl,
  pickLiveStreamForDevice,
} from "@/lib/stream-playback";
import { CANAL10_HLS, CANAL10_OFFICIAL, TELEANTILLAS_OFFICIAL } from "@/lib/live-channels";
import { isMobileDevice } from "@/lib/device";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  streamUrl: string;
  titulo: string;
  streamFallbacks?: string[];
};

const LOAD_TIMEOUT_MS = 12_000;

function isCanal10Embed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "www.canal10.com.ni" || hostname === "canal10.com.ni";
  } catch {
    return false;
  }
}

function isTeleAntillasEmbed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "teleantillas.com.do" || hostname === "www.teleantillas.com.do"
    );
  } catch {
    return false;
  }
}

function isTeleAntillasChannel(streamUrl: string, activeStreamUrl: string): boolean {
  return [streamUrl, activeStreamUrl].some(
    (u) =>
      u.includes("dailymotion.com/embed/video/x8mwmvs") ||
      u.includes("TELEANTILLAS") ||
      u.includes("teleantillas.com.do"),
  );
}

function isHlsPlaybackUrl(url: string): boolean {
  return (
    url.includes(".m3u8") ||
    url.includes("/api/hls") ||
    isDailyMotionStreamUrl(url)
  );
}

function LivePlayerInner({
  streamUrl,
  titulo,
  streamFallbacks = [],
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Awaited<ReturnType<typeof attachLiveHls>>>(null);
  const sourceIndexRef = useRef(0);
  const loadTokenRef = useRef(0);

  const preferredUrl = useMemo(
    () =>
      pickLiveStreamForDevice(
        streamUrl,
        streamFallbacks,
        typeof window !== "undefined" && isMobileDevice(),
      ),
    [streamUrl, streamFallbacks],
  );

  const [activeStreamUrl, setActiveStreamUrl] = useState(preferredUrl);
  const [hlsLoading, setHlsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const sources = useMemo(
    () => [streamUrl, ...streamFallbacks],
    [streamUrl, streamFallbacks],
  );

  const isHls = isHlsPlaybackUrl(activeStreamUrl);
  const isEmbedPage = isKnownEmbedUrl(activeStreamUrl);

  const {
    watchPositionRef,
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    consumePendingStart,
  } = useLiveAdTriggers();

  useKeepPlayingDuringMidroll({
    gateOpen,
    gateKind,
    videoRef,
  });

  useEffect(() => {
    const idx = sources.indexOf(preferredUrl);
    sourceIndexRef.current = idx >= 0 ? idx : 0;
    setActiveStreamUrl(preferredUrl);
    setPlaybackError(false);
  }, [preferredUrl, sources]);

  const tryNextSource = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    if (nextIndex >= sources.length) {
      setPlaybackError(true);
      setHlsLoading(false);
      return false;
    }
    sourceIndexRef.current = nextIndex;
    setActiveStreamUrl(sources[nextIndex]!);
    setPlaybackError(false);
    setReloadKey((k) => k + 1);
    return true;
  }, [sources]);

  const restartStream = useCallback(() => {
    sourceIndexRef.current = 0;
    setActiveStreamUrl(preferredUrl);
    setPlaybackError(false);
    setHlsLoading(false);
    setReloadKey((k) => k + 1);
  }, [preferredUrl]);

  const startLive = useCallback(() => {
    setPlaybackError(false);
    requestPreroll();
  }, [requestPreroll]);

  useEffect(() => {
    if (!started) return;
    if (gateOpen && gateKind === "preroll") return;
    if (consumePendingStart()) void videoRef.current?.play().catch(() => undefined);
  }, [started, gateOpen, gateKind, consumePendingStart]);

  useEffect(() => {
    if (!hlsLoading || !started) return;
    const id = window.setTimeout(() => {
      setHlsLoading(false);
      if (!tryNextSource()) setPlaybackError(true);
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [hlsLoading, started, tryNextSource, activeStreamUrl, reloadKey]);

  useEffect(() => {
    if (!isHls || !videoRef.current || !started) return;

    const video = videoRef.current;
    const loadToken = ++loadTokenRef.current;
    let cancelled = false;

    setHlsLoading(true);

    void attachLiveHls({
      url: activeStreamUrl,
      video,
      onReady: () => {
        if (cancelled || loadToken !== loadTokenRef.current) return;
        setHlsLoading(false);
        void video.play().catch(() => undefined);
      },
      onFatalError: () => {
        if (cancelled || loadToken !== loadTokenRef.current) return;
        hlsRef.current?.destroy();
        hlsRef.current = null;
        if (!tryNextSource()) setPlaybackError(true);
      },
    })
      .then((hls) => {
        if (cancelled || loadToken !== loadTokenRef.current) {
          hls?.destroy();
          return;
        }
        hlsRef.current?.destroy();
        hlsRef.current = hls;
        void video.play().catch(() => undefined);
      })
      .catch(() => {
        if (cancelled || loadToken !== loadTokenRef.current) return;
        if (!tryNextSource()) setPlaybackError(true);
      });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [activeStreamUrl, isHls, started, tryNextSource, reloadKey]);

  const onVideoTimeUpdate = () => {
    const t = videoRef.current?.currentTime;
    if (typeof t === "number" && !videoRef.current?.paused) {
      watchPositionRef.current = Math.max(watchPositionRef.current, t);
    }
  };

  const playerBody = isEmbedPage ? (
    <div className="relative h-full min-h-[280px] w-full">
      <CastToTvButton titulo={titulo} streamUrl={activeStreamUrl} visible={started} />
      <iframe
        title={titulo}
        src={activeStreamUrl}
        className="absolute inset-0 h-full w-full rounded-none bg-black"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        scrolling="yes"
      />
      {started && (isCanal10Embed(activeStreamUrl) || isTeleAntillasEmbed(activeStreamUrl)) ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-3 pt-8 text-center">
          <p className="pointer-events-auto text-xs text-brand-muted">
            Si la señal está negra, toca ▶ dentro del reproductor o abre el sitio
            oficial.
          </p>
          <a
            href={
              isCanal10Embed(activeStreamUrl) ? CANAL10_OFFICIAL : TELEANTILLAS_OFFICIAL
            }
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto mt-2 inline-block touch-manipulation rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white"
          >
            {isCanal10Embed(activeStreamUrl) ? "Abrir Canal 10" : "Abrir Tele Antillas"}
          </a>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="relative h-full min-h-[280px] w-full">
      <CastToTvButton
        titulo={titulo}
        streamUrl={activeStreamUrl}
        videoRef={videoRef}
        visible={started}
      />
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        muted
        disableRemotePlayback={false}
        className="absolute inset-0 h-full w-full bg-black object-contain"
        src={isHls ? undefined : activeStreamUrl}
        title={titulo}
        onTimeUpdate={onVideoTimeUpdate}
        onPlaying={() => setHlsLoading(false)}
        onCanPlay={() => setHlsLoading(false)}
      />
      {hlsLoading && started ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <span className="text-xs text-brand-muted">Conectando señal…</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <SplitScreenAdPanel
      visible={gateOpen}
      kind={gateKind}
      onComplete={completeGate}
    >
      <div className="relative aspect-video w-full min-h-[280px]">
        {!started && !gateOpen ? (
          <button
            type="button"
            onClick={startLive}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 transition hover:bg-black/80"
            aria-label={`Ver en vivo ${titulo}`}
          >
            <span className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-brand-red text-3xl shadow-lg">
              ▶
            </span>
            <span className="text-sm font-semibold text-white">Ver en vivo</span>
            <span className="mt-1 text-xs text-brand-muted">{titulo}</span>
          </button>
        ) : null}
        {playbackError ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 p-4 text-center">
            <p className="text-sm text-brand-muted">
              No se pudo conectar al canal. Prueba reintentar o abrir la señal
              oficial.
              {streamUrl.includes("canal10.com.ni") ||
              activeStreamUrl.includes("canal10.com.ni") ||
              streamUrl.includes("cloudfront.net") ? (
                <>
                  {" "}
                  Canal 10 puede estar geo-bloqueado fuera de Nicaragua.
                </>
              ) : null}
            </p>
            {isCanal10Embed(activeStreamUrl) || streamUrl === CANAL10_HLS ? (
              <a
                href={CANAL10_OFFICIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-manipulation rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Abrir en Canal 10
              </a>
            ) : null}
            {isTeleAntillasChannel(streamUrl, activeStreamUrl) ||
            isTeleAntillasEmbed(activeStreamUrl) ? (
              <a
                href={TELEANTILLAS_OFFICIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-manipulation rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Abrir en Tele Antillas
              </a>
            ) : null}
            <button
              type="button"
              onClick={restartStream}
              className="rounded-full bg-brand-red px-6 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        ) : null}
        {playerBody}
      </div>
    </SplitScreenAdPanel>
  );
}

export function MonetizedLivePlayer(props: Props) {
  const [boundaryKey, setBoundaryKey] = useState(0);

  return (
    <PlayerErrorBoundary onRetry={() => setBoundaryKey((k) => k + 1)}>
      <LivePlayerInner key={boundaryKey} {...props} />
    </PlayerErrorBoundary>
  );
}
