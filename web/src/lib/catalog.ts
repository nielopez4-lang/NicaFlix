import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import { fetchFilmRiseCatalog } from "@/lib/filmrise";
import { fetchHorrorCentralCatalog } from "@/lib/horror-central";
import { fetchSpanishCinemaCatalog } from "@/lib/spanish-cinema";
import type { Categoria, CatalogResponse, ContentItem } from "@/types/content";

const STAT_KEYS: Categoria[] = [
  "accion",
  "comedia",
  "familia",
  "terror",
  "peliculas",
  "series",
  "anime",
  "kids",
];

function dedupeCatalog(items: ContentItem[]): ContentItem[] {
  const seenYoutube = new Set<string>();
  const seenStream = new Set<string>();
  const unique: ContentItem[] = [];

  for (const item of items) {
    if (item.youtubeId) {
      if (seenYoutube.has(item.youtubeId)) continue;
      seenYoutube.add(item.youtubeId);
    }
    if (item.streamUrl) {
      if (seenStream.has(item.streamUrl)) continue;
      seenStream.add(item.streamUrl);
    }
    unique.push(item);
  }

  return unique;
}

export async function fetchFullCatalog(): Promise<ContentItem[]> {
  const [spanishCinema, filmrise, horrorCentral, archive, anime] =
    await Promise.all([
      fetchSpanishCinemaCatalog(),
      fetchFilmRiseCatalog(),
      fetchHorrorCentralCatalog(),
      fetchArchiveCatalog(),
      fetchJikanAnime(),
    ]);

  return dedupeCatalog([
    ...spanishCinema,
    ...filmrise,
    ...horrorCentral,
    ...archive,
    ...anime,
  ]).filter((item) => Boolean(item.youtubeId || item.streamUrl));
}

export function buildCatalogStats(catalogo: ContentItem[]): CatalogResponse["stats"] {
  const stats: Record<string, number> = { total: catalogo.length };
  for (const key of STAT_KEYS) {
    stats[key] = catalogo.filter((c) => c.categoria === key).length;
  }
  return stats;
}

export async function fetchCatalogResponse(): Promise<CatalogResponse> {
  const catalogo = await fetchFullCatalog();
  return { catalogo, stats: buildCatalogStats(catalogo) };
}
