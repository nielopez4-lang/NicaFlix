"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useLiveAdTriggers } from "@/hooks/useLiveAdTriggers";
import { isDailyMotionStreamUrl } from "@/lib/stream-playback";
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

  const sources = useMemo(
    () => [streamUrl, ...streamFallbacks],
    [streamUrl, streamFallbacks],
  );

  const isHls = isHlsPlaybackUrl(activeStreamUrl);
  const isPageUrl = !isHls && !activeStreamUrl.match(/\.mp4|\.mpd/i);

  const {
    watchPositionRef,
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    consumePendingStart,
  } = useLiveAdTriggers();

  useEffect(() => {
    sourceIndexRef.current = 0;
    setActiveStreamUrl(streamUrl);
  }, [streamUrl]);

  const tryNextSource = useCallback(() => {
    const nextIndex = sourceIndexRef.current + 1;
    if (nextIndex >= sources.length) return false;
    sourceIndexRef.current = nextIndex;
    setActiveStreamUrl(sources[nextIndex]!);
    return true;
  }, [sources]);

  useEffect(() => {
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
      const Hls = (await import("hls.js")).default;
      if (!Hls.isSupported() || !videoRef.current || cancelled) {
        if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = activeStreamUrl;
          void videoRef.current.play().catch(() => undefined);
        }
        return;
      }

      hlsRef.current?.destroy();
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(activeStreamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
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

  const playerBody = isPageUrl ? (
    <div className="relative h-full min-h-[160px] w-full">
      <CastToTvButton titulo={titulo} streamUrl={activeStreamUrl} visible={started} />
      {started ? (
        <iframe
          title={titulo}
          src={activeStreamUrl}
          className="h-full min-h-[160px] w-full rounded-none bg-black"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-black/80">
          <span className="text-sm text-brand-muted">Cargando en vivo…</span>
        </div>
      )}
    </div>
  ) : (
    <div className="relative h-full min-h-[160px] w-full">
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
        className="h-full min-h-[160px] w-full bg-black object-contain"
        src={isHls ? undefined : activeStreamUrl}
        title={titulo}
        onTimeUpdate={onVideoTimeUpdate}
      />
    </div>
  );

  return (
    <SplitScreenAdPanel
      visible={gateOpen}
      kind={gateKind}
      onComplete={completeGate}
    >
      {playerBody}
    </SplitScreenAdPanel>
  );
}
