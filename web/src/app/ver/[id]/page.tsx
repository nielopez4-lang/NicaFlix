import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import { VideoPlayer } from "@/components/VideoPlayer";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function VerPage({ params }: Props) {
  const { id } = await params;
  const [archive, anime] = await Promise.all([
    fetchArchiveCatalog(),
    fetchJikanAnime(),
  ]);
  const item = [...archive, ...anime].find((c) => c.id === id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{item.titulo}</h1>
      <p className="mt-4 text-brand-muted">{item.sinopsis}</p>
      <div className="mt-8 overflow-hidden rounded-2xl">
        <VideoPlayer
          streamUrl={item.streamUrl}
          youtubeId={item.youtubeId}
          titulo={item.titulo}
        />
      </div>
    </main>
  );
}
