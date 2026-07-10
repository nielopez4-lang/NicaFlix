import type { Categoria, ContentItem } from "@/types/content";
import { fetchYoutubeRss, type RssVideo } from "@/lib/youtube-rss";

/** Canales con películas completas recientes en español (YouTube RSS oficial). */
const SPANISH_MOVIE_FEEDS: Array<{ source: string; url: string }> = [
  {
    source: "megacine",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC6ZcZrCYzfM8fNoO7gD1YkA",
  },
  {
    source: "netmovies",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCLIPxE1nQC-mv3Mx3HusUoA",
  },
  {
    source: "vespanol",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCH6uKFPQcZLihwbnzxnw1dA",
  },
  {
    source: "wowcine",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCrZKOE8p9y-UtDelMHVC3-A",
  },
  {
    source: "suspenso",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCcLzwVXQXSFlWYzhnYTaWqw",
  },
  {
    source: "romance2026",
    url: "https://www.youtube.com/feeds/videos.xml?playlist_id=PLf5AXxQiJym_HPBpawCpjbAwCRu1DIosq",
  },
];

const SPANISH_BRAND_SOURCES = new Set([
  "megacine",
  "netmovies",
  "vespanol",
  "suspenso",
  "romance2026",
]);

function isSpanishFullMovie(video: RssVideo, source: string): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  const isFull =
    /pel[ií]cula completa|pelicula completa|full movie|pel[ií]cula de |pelicula de /.test(
      text,
    );
  const isSpanish =
    SPANISH_BRAND_SOURCES.has(source) ||
    /español|espanol|latino|castellano|#peliculascompletas|peliculas completas en/.test(
      text,
    );
  return isFull && isSpanish;
}

function isHdOrRecent(video: RssVideo, source: string): boolean {
  if (source === "megacine") return true;
  const text = `${video.title} ${video.desc}`.toLowerCase();
  if (/1080|720|\bhd\b|4k|full hd|alta definici/i.test(text)) return true;
  const year = Number.parseInt(video.published.slice(0, 4), 10);
  return Number.isFinite(year) && year >= 2024;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*PELA?CULA COMPLETA DE [A-ZÁÉÍÓÚÑ]+.*$/i, "")
    .replace(/\s*NetMovies\s*-?\s*Pel[ií]culas En Espa[nñ]ol.*$/i, "")
    .replace(/\s*[|｜]\s*HD\s*[|｜].*$/i, "")
    .replace(/\s*[|｜]\s*PELICULA COMPLETA.*$/i, "")
    .replace(/\s*[|｜]\s*Pel[ií]cula Completa.*$/i, "")
    .replace(/\s*[|｜]\s*Pelicula de .*$/i, "")
    .replace(/\s*#\S+/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyGenre(video: RssVideo): Categoria {
  const text = `${video.title} ${video.desc}`.toLowerCase();

  if (
    /terror|horror|miedo|suspenso|suspense|psicol[oó]gic|slasher|vampir|monstruo|fantasm|dr[aá]cula|misterio|mister/i.test(
      text,
    )
  ) {
    return "terror";
  }

  if (
    /comedia|comedy|risa|humor|romance|romantic|amor|enamor|pareja|boda/i.test(
      text,
    )
  ) {
    return "comedia";
  }

  if (
    /familia|family|infantil|niñ|animaci[oó]n|aventura familiar|drama familiar/i.test(
      text,
    )
  ) {
    return "familia";
  }

  if (
    /accion|acción|action|aventura|thriller|guerra|fight|combat|polic|crimen|western|ciencia fic|sci-fi|espacio/i.test(
      text,
    )
  ) {
    return "accion";
  }

  return "accion";
}

function toContentItem(video: RssVideo, categoria: Categoria): ContentItem {
  const year = video.published.slice(0, 4);
  const month = video.published.slice(5, 7);
  return {
    id: `es-${video.id}`,
    titulo: cleanTitle(video.title),
    sinopsis:
      video.desc.slice(0, 240) ||
      `Película completa en español (${year}). Estreno reciente en HD vía YouTube.`,
    portada: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    categoria,
    youtubeId: video.id,
    fuente: "spanish-cinema",
    idioma: "es",
    anio: `${year}-${month}`,
  };
}

/** Películas recientes en español HD (2024–2026) desde canales oficiales de YouTube. */
export async function fetchSpanishCinemaCatalog(): Promise<ContentItem[]> {
  const batches = await Promise.all(
    SPANISH_MOVIE_FEEDS.map(async ({ source, url }) => ({
      source,
      videos: await fetchYoutubeRss(url),
    })),
  );

  const byId = new Map<
    string,
    { video: RssVideo; categoria: Categoria; published: string }
  >();

  for (const { source, videos } of batches) {
    for (const video of videos) {
      if (!isSpanishFullMovie(video, source)) continue;
      if (!isHdOrRecent(video, source)) continue;

      const categoria = classifyGenre(video);
      const existing = byId.get(video.id);
      if (!existing) {
        byId.set(video.id, { video, categoria, published: video.published });
        continue;
      }
      if (
        new Date(video.published).getTime() >
        new Date(existing.published).getTime()
      ) {
        existing.video = video;
        existing.published = video.published;
      }
      if (existing.categoria === "accion" && categoria !== "accion") {
        existing.categoria = categoria;
      }
    }
  }

  return [...byId.values()]
    .map(({ video, categoria }) => toContentItem(video, categoria))
    .sort((a, b) => (b.anio ?? "").localeCompare(a.anio ?? ""))
    .slice(0, 90);
}
