import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import { fetchFilmRiseCatalog } from "@/lib/filmrise";
import { fetchHorrorCentralCatalog } from "@/lib/horror-central";
import { fetchSpanishCinemaCatalog } from "@/lib/spanish-cinema";
import { filterPlayableIds } from "@/lib/youtube-embed";
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

/** IDs auditados en producción que no reproducen — excluir siempre. */
const BLOCKED_YOUTUBE_IDS = new Set([
  "dxEvrXq_a4g",
  "wmgRXQhPOwA",
  "Hu37w9kP14g",
  "tPBTj2eZxII",
  "wLBCwwPgak8",
  "BMj9ZCma9PU",
  "vJL_Mv9IO-M",
  "z9MzLzDAqVM",
  "LOTwYX-qtS8",
  "dYEgb2Q0YEs",
  "qyxQxgH2eu8",
  "99lFJOUt18I",
  "fXliir76uw4",
  "QR6UaHSBYN0",
  "6P9HGkMw9lA",
  "xjJPJ7Q3jn0",
  "7dJs0pDNe6Q",
  "6HT5hIWglco",
  "xJBTNO5UPOs",
  "JEIQ9sVHzdo",
  "XNE6TYYVdY4",
  "9WzKIV8kWU8",
  "UGrAajc0CxE",
  "57BMqiCzYus",
  "gPuYJ0nJxcc",
  "TfeQZpxCZTg",
  "-FeML5V4APY",
  "RnPHXMBAF2o",
  "7sNOp94CqCo",
  "z2EK9l2kcEw",
  "JRwc3G-Knwo",
  "cILIknN2ex8",
  "Vj4BViJFi8M",
  "FuM0f7LqM8o",
  "_UqIDMbBpY4",
  "FqbNML9sD0M",
  "fG1HN2Zae5w",
]);

/** jikan es el único que no valida en origen — filtro final. */
const PLAYABILITY_CHECK_SOURCES = new Set(["jikan"]);

/** Prioridad al deduplicar (menor = preferido). */
const SOURCE_PRIORITY: Record<string, number> = {
  filmrise: 0,
  "horror-central": 1,
  archive: 2,
  "spanish-cinema": 3,
  jikan: 4,
};

function sourceRank(item: ContentItem): number {
  return SOURCE_PRIORITY[item.fuente ?? ""] ?? 99;
}

function dedupeCatalog(items: ContentItem[]): ContentItem[] {
  const byYoutube = new Map<string, ContentItem>();
  const byStream = new Map<string, ContentItem>();

  for (const item of items) {
    if (item.youtubeId) {
      const existing = byYoutube.get(item.youtubeId);
      if (!existing || sourceRank(item) < sourceRank(existing)) {
        byYoutube.set(item.youtubeId, item);
      }
      continue;
    }
    if (item.streamUrl && !byStream.has(item.streamUrl)) {
      byStream.set(item.streamUrl, item);
    }
  }

  return [...byYoutube.values(), ...byStream.values()];
}

async function filterPlayableCatalog(
  items: ContentItem[],
): Promise<ContentItem[]> {
  const needsCheck = items.filter(
    (item) =>
      item.youtubeId &&
      item.fuente &&
      PLAYABILITY_CHECK_SOURCES.has(item.fuente),
  );
  const rest = items.filter(
    (item) =>
      !item.youtubeId ||
      !item.fuente ||
      !PLAYABILITY_CHECK_SOURCES.has(item.fuente),
  );

  if (needsCheck.length === 0) return items;

  const playable = await filterPlayableIds(
    needsCheck.map((item) => item.youtubeId!),
    4,
  );

  return [
    ...rest,
    ...needsCheck.filter((item) => playable.has(item.youtubeId!)),
  ];
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

  const merged = dedupeCatalog([
    ...filmrise,
    ...horrorCentral,
    ...archive,
    ...spanishCinema,
    ...anime,
  ])
    .filter((item) => Boolean(item.youtubeId || item.streamUrl))
    .filter(
      (item) => !item.youtubeId || !BLOCKED_YOUTUBE_IDS.has(item.youtubeId),
    );

  return filterPlayableCatalog(merged);
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
