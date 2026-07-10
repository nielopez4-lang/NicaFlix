import { fetchFullCatalog } from "@/lib/catalog";
import { AdSlot } from "@/components/AdSlot";
import { MonetizedVideoPlayer } from "@/components/MonetizedVideoPlayer";
import { PlayerErrorBoundary } from "@/components/PlayerErrorBoundary";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function VerPage({ params }: Props) {
  const { id } = await params;
  const catalogo = await fetchFullCatalog();
  const item = catalogo.find((c) => c.id === id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{item.titulo}</h1>
      {item.fuente === "filmrise" && (
        <p className="mt-2 text-sm text-brand-muted">
          FilmRise Movies · YouTube · {item.anio}
          {item.idioma === "es" ? " · Español" : " · Audio/subtítulos en reproductor"}
        </p>
      )}
      {item.fuente === "horror-central" && (
        <p className="mt-2 text-sm text-brand-muted">
          Central de Películas - TERROR &amp; HORROR · YouTube HD · {item.anio} · Español
        </p>
      )}
      {item.fuente === "spanish-cinema" && (
        <p className="mt-2 text-sm text-brand-muted">
          Estreno en español · HD · YouTube · {item.anio}
        </p>
      )}
      {item.fuente === "archive" && (
        <p className="mt-2 text-sm text-brand-muted">
          Internet Archive · Dominio público · {item.categoria}
        </p>
      )}
      {item.fuente === "jikan" && (
        <p className="mt-2 text-sm text-brand-muted">
          Tráiler oficial · MyAnimeList
        </p>
      )}
      <p className="mt-4 text-brand-muted">{item.sinopsis}</p>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <PlayerErrorBoundary>
          <MonetizedVideoPlayer
            streamUrl={item.streamUrl}
            youtubeId={item.youtubeId}
            titulo={item.titulo}
            portada={item.portada}
          />
        </PlayerErrorBoundary>
      </div>

      <AdSlot slot="PLAYER_BOTTOM" className="my-8" />
    </main>
  );
}
