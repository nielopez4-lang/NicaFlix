import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import { fetchFilmRiseCatalog } from "@/lib/filmrise";
import { fetchHorrorCentralCatalog } from "@/lib/horror-central";
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

export async function fetchFullCatalog(): Promise<ContentItem[]> {
  const [filmrise, horrorCentral, archive, anime] = await Promise.all([
    fetchFilmRiseCatalog(),
    fetchHorrorCentralCatalog(),
    fetchArchiveCatalog(),
    fetchJikanAnime(),
  ]);
  return [...filmrise, ...horrorCentral, ...archive, ...anime];
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
