"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useLiveAdTriggers } from "@/hooks/useLiveAdTriggers";
import { useEffect, useRef } from "react";

type Props = { streamUrl: string; titulo: string };

export function MonetizedLivePlayer({ streamUrl, titulo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHls =
    streamUrl.includes(".m3u8") || streamUrl.includes("/api/hls");
  const isPageUrl = !isHls && !streamUrl.match(/\.mp4|\.mpd/i);

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
    requestPreroll();
  }, [requestPreroll]);

  useEffect(() => {
    if (!started) return;
    if (gateOpen && gateKind === "preroll") return;
    if (consumePendingStart()) void videoRef.current?.play().catch(() => undefined);
  }, [started, gateOpen, gateKind, consumePendingStart]);

  useEffect(() => {
    if (!isHls || !videoRef.current || !started) return;
    let hls: import("hls.js").default | null = null;

    (async () => {
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported() && videoRef.current) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) hls?.destroy();
        });
        void videoRef.current.play().catch(() => undefined);
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
        void videoRef.current.play().catch(() => undefined);
      }
    })();

    return () => {
      hls?.destroy();
    };
  }, [streamUrl, isHls, started]);

  const onVideoTimeUpdate = () => {
    const t = videoRef.current?.currentTime;
    if (typeof t === "number" && !videoRef.current?.paused) {
      watchPositionRef.current = Math.max(watchPositionRef.current, t);
    }
  };

  const playerBody = isPageUrl ? (
    <div className="relative h-full min-h-[160px] w-full">
      <CastToTvButton titulo={titulo} streamUrl={streamUrl} visible={started} />
      {started ? (
        <iframe
          title={titulo}
          src={streamUrl}
          className="h-full min-h-[160px] w-full rounded-none bg-black"
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
        streamUrl={streamUrl}
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
        src={isHls ? undefined : streamUrl}
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
