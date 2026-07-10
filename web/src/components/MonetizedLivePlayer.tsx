"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useKeepPlayingDuringMidroll } from "@/hooks/useKeepPlayingDuringMidroll";
import { useLiveAdTriggers } from "@/hooks/useLiveAdTriggers";
import {
  isDailyMotionStreamUrl,
  isKnownEmbedUrl,
} from "@/lib/stream-playback";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  streamUrl: string;
  titulo: string;
  streamFallbacks?: string[];
};

function isHlsPlaybackUrl(url: string): boolean {
  return (
    url.includes(".m3u8") ||
    url.includes("/api/hls") ||
    isDailyMotionStreamUrl(url)
  );
}

export function MonetizedLivePlayer({
  streamUrl,
  titulo,
  streamFallbacks = [],
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const sourceIndexRef = useRef(0);
  const [activeStreamUrl, setActiveStreamUrl] = useState(streamUrl);
  const [hlsLoading, setHlsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);

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
    sourceIndexRef.current = 0;
    setActiveStreamUrl(streamUrl);
    setPlaybackError(false);
  }, [streamUrl]);

  const tryNextSource = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    if (nextIndex >= sources.length) {
      setPlaybackError(true);
      return false;
    }
    sourceIndexRef.current = nextIndex;
    setActiveStreamUrl(sources[nextIndex]!);
    setPlaybackError(false);
    return true;
  }, [sources]);

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
    if (!isHls || !videoRef.current || !started) return;
    let cancelled = false;

    (async () => {
      setHlsLoading(true);
      const Hls = (await import("hls.js")).default;
      if (!Hls.isSupported() || !videoRef.current || cancelled) {
        if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = activeStreamUrl;
          void videoRef.current.play().catch(() => undefined);
        }
        if (!cancelled) setHlsLoading(false);
        return;
      }

      hlsRef.current?.destroy();
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(activeStreamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) setHlsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        setHlsLoading(false);
        hls.destroy();
        hlsRef.current = null;
        if (!tryNextSource()) {
          void videoRef.current?.play().catch(() => undefined);
        }
      });

      void videoRef.current.play().catch(() => undefined);
    })();

    return () => {
      cancelled = true;
      setHlsLoading(false);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [activeStreamUrl, isHls, started, tryNextSource]);

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
      />
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
        autoPlay={started}
        playsInline
        disableRemotePlayback={false}
        x-webkit-airplay="allow"
        className="absolute inset-0 h-full w-full bg-black object-contain"
        src={isHls ? undefined : activeStreamUrl}
        title={titulo}
        onTimeUpdate={onVideoTimeUpdate}
        onPlaying={() => setHlsLoading(false)}
      />
      {hlsLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
        </div>
      ) : null}
    </div>
  );

  const playerShell = (
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
            No se pudo conectar al canal. Intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={() => {
              sourceIndexRef.current = 0;
              setActiveStreamUrl(streamUrl);
              setPlaybackError(false);
              if (started) void videoRef.current?.play().catch(() => undefined);
            }}
            className="rounded-full bg-brand-red px-6 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {playerBody}
    </div>
  );

  return (
    <SplitScreenAdPanel
      visible={gateOpen}
      kind={gateKind}
      onComplete={completeGate}
    >
      {playerShell}
    </SplitScreenAdPanel>
  );
}
