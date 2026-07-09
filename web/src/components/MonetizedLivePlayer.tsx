"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdPanel } from "@/components/SplitScreenAdPanel";
import { useLiveAdTriggers } from "@/hooks/useLiveAdTriggers";
import { useCallback, useEffect, useRef } from "react";

type Props = { streamUrl: string; titulo: string };

export function MonetizedLivePlayer({ streamUrl, titulo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHls = streamUrl.includes(".m3u8");
  const isPageUrl = !isHls && !streamUrl.match(/\.mp4|\.mpd/i);

  const {
    watchPositionRef,
    started,
    gateOpen,
    gateKind,
    requestPreroll,
    completeGate,
    consumePendingStart,
    consumePendingResume,
  } = useLiveAdTriggers();

  const pausePlayback = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const resumePlayback = useCallback(() => {
    void videoRef.current?.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    requestPreroll();
  }, [requestPreroll]);

  useEffect(() => {
    if (gateOpen && gateKind === "midroll") pausePlayback();
  }, [gateOpen, gateKind, pausePlayback]);

  useEffect(() => {
    if (!started || gateOpen) return;
    if (consumePendingStart()) void videoRef.current?.play().catch(() => undefined);
    if (consumePendingResume()) resumePlayback();
  }, [started, gateOpen, consumePendingStart, consumePendingResume, resumePlayback]);

  useEffect(() => {
    if (!isHls || !videoRef.current || !started || gateOpen) return;
    let hls: import("hls.js").default | null = null;

    (async () => {
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported() && videoRef.current) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        void videoRef.current.play().catch(() => undefined);
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
        void videoRef.current.play().catch(() => undefined);
      }
    })();

    return () => {
      hls?.destroy();
    };
  }, [streamUrl, isHls, started, gateOpen]);

  const onVideoTimeUpdate = () => {
    const t = videoRef.current?.currentTime;
    if (typeof t === "number" && !videoRef.current?.paused) {
      watchPositionRef.current = Math.max(watchPositionRef.current, t);
    }
  };

  const playerBody = isPageUrl ? (
    <div className="relative aspect-video w-full">
      <CastToTvButton titulo={titulo} streamUrl={streamUrl} visible={started && !gateOpen} />
      {started && !gateOpen ? (
        <iframe
          title={titulo}
          src={streamUrl}
          className="aspect-video w-full rounded-2xl bg-black"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black/80">
          <span className="text-sm text-brand-muted">Programa en vivo</span>
        </div>
      )}
    </div>
  ) : (
    <div className="relative aspect-video w-full">
      <CastToTvButton
        titulo={titulo}
        streamUrl={streamUrl}
        videoRef={videoRef}
        visible={started && !gateOpen}
      />
      <video
        ref={videoRef}
        controls
        autoPlay={started && !gateOpen}
        playsInline
        disableRemotePlayback={false}
        x-webkit-airplay="allow"
        className="aspect-video w-full rounded-2xl bg-black"
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
