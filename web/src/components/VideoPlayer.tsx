"use client";

import { CastToTvButton } from "@/components/CastToTvButton";
import { useRef } from "react";

type Props = {
  streamUrl?: string;
  youtubeId?: string;
  titulo: string;
};

export function VideoPlayer({ streamUrl, youtubeId, titulo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (youtubeId) {
    return (
      <div className="relative aspect-video w-full">
        <CastToTvButton titulo={titulo} youtubeId={youtubeId} visible />
        <iframe
          title={titulo}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0`}
          className="aspect-video w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  if (streamUrl) {
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
          playsInline
          disableRemotePlayback={false}
          x-webkit-airplay="allow"
          className="aspect-video w-full bg-black"
          src={streamUrl}
          title={titulo}
        />
      </div>
    );
  }

  return (
    <p className="rounded-xl bg-brand-card p-8 text-center text-brand-muted">
      Reproductor no disponible para este título.
    </p>
  );
}
