"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { useEffect, useRef } from "react";

type Props = { streamUrl: string; titulo: string };

export function LivePlayer({ streamUrl, titulo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHls = streamUrl.includes(".m3u8");
  const isPageUrl = !isHls && !streamUrl.match(/\.mp4|\.mpd/i);

  useEffect(() => {
    if (!isHls || !videoRef.current) return;
    let hls: import("hls.js").default | null = null;

    (async () => {
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported() && videoRef.current) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
      }
    })();

    return () => {
      hls?.destroy();
    };
  }, [streamUrl, isHls]);

  if (isPageUrl) {
    return (
      <div className="relative aspect-video w-full">
        <CastToTvButton titulo={titulo} streamUrl={streamUrl} visible />
        <iframe
          title={titulo}
          src={streamUrl}
          className="aspect-video w-full rounded-2xl bg-black"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full">
      <CastToTvButton
        titulo={titulo}
        streamUrl={streamUrl}
        videoRef={videoRef}
        visible
      />
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        disableRemotePlayback={false}
        x-webkit-airplay="allow"
        className="aspect-video w-full rounded-2xl bg-black"
        src={isHls ? undefined : streamUrl}
        title={titulo}
      />
    </div>
  );
}
