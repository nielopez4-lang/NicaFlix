"use client";

type Props = {
  streamUrl?: string;
  youtubeId?: string;
  titulo: string;
};

export function VideoPlayer({ streamUrl, youtubeId, titulo }: Props) {
  if (youtubeId) {
    return (
      <iframe
        title={titulo}
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0`}
        className="aspect-video w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  if (streamUrl) {
    return (
      <video
        controls
        playsInline
        className="aspect-video w-full bg-black"
        src={streamUrl}
        title={titulo}
      />
    );
  }

  return (
    <p className="rounded-xl bg-brand-card p-8 text-center text-brand-muted">
      Reproductor no disponible para este título.
    </p>
  );
}
