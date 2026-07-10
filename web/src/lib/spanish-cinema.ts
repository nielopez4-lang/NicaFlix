import type { Categoria, ContentItem } from "@/types/content";
import { filterPlayableIds } from "@/lib/youtube-embed";
import { fetchYoutubeRss, type RssVideo } from "@/lib/youtube-rss";

/**
 * Solo canales/playlists cuyos videos pasan verificación de reproducción.
 * horror-es eliminado (duplica horror-central / hc-*).
 * vespanol eliminado (canal RSS caído).
 */
const SPANISH_MOVIE_FEEDS: Array<{ source: string; url: string }> = [
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

const TRUSTED_SOURCES = new Set(["wowcine", "suspenso", "romance2026"]);

/** Agregadores geo-bloqueados o spam de título — nunca listar. */
const BLOCKED_TITLE_PATTERN =
  /netmovies|megacine|wowcine full|pel[ií]cula completa de\s+(acci[oó]n|romance|terror|suspenso|aventura|drama|ficci)/i;

function isSpanishFullMovie(video: RssVideo, source: string): boolean {
  if (BLOCKED_TITLE_PATTERN.test(video.title)) return false;

  const text = `${video.title} ${video.desc}`.toLowerCase();
  const isFull =
    /pel[ií]cula completa|pelicula completa|full movie|pel[ií]cula de |pelicula de /.test(
      text,
    );
  const isSpanish =
    TRUSTED_SOURCES.has(source) ||
    /español|espanol|latino|castellano|#peliculascompletas|peliculas completas en/.test(
      text,
    );
  return isFull && isSpanish;
}

function isHdOrRecent(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  if (/1080|720|\bhd\b|4k|full hd|alta definici/i.test(text)) return true;
  const year = Number.parseInt(video.published.slice(0, 4), 10);
  return Number.isFinite(year) && year >= 2024;
}

export function cleanSpanishMovieTitle(title: string): string {
  let t = title
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u26FF]/gu, "")
    .replace(/\s*#\S+/g, "")
    .replace(/\s*\?\?\s*/g, " ");

  t = t.replace(
    /\s*PEL[IÍA]?CULA\s+COMPLETA\s+DE\s+[A-ZÁÉÍÓÚÜÑa-záéíóúüñ]+\s*/gi,
    "",
  );
  t = t.replace(/\s*NetMovies[\s\S]*$/i, "");
  t = t.replace(/\s*Pel[ií]culas?\s+Completas?\s+En\s+Espa[nñ]ol[\s\S]*$/i, "");
  t = t.replace(/\s*[|｜]\s*HD\s*[|｜].*$/i, "");
  t = t.replace(/\s*[|｜]\s*PELICULA COMPLETA.*$/i, "");
  t = t.replace(/\s*[|｜]\s*Pel[ií]cula Completa.*$/i, "");
  t = t.replace(/\s*[|｜]\s*Pel[ií]cula de .*$/i, "");
  t = t.replace(/\s*\|\s*Pel[ií]cula Completa.*$/i, "");

  return t.replace(/\s+/g, " ").trim();
}

function classifyGenre(video: RssVideo): Categoria {
  const text = `${video.title} ${video.desc}`.toLowerCase();

  if (
    /terror|horror|miedo|suspenso|suspense|psicol[oó]gic|slasher|vampir|monstruo|fantasm|dr[aá]cula|misterio|mister|culto|drácula/.test(
      text,
    )
  ) {
    return "terror";
  }

  if (
    /comedia|comedy|risa|humor|romance|romantic|amor|enamor|pareja|boda|atardecer/.test(
      text,
    )
  ) {
    return "comedia";
  }

  if (
    /familia|family|infantil|niñ|animaci[oó]n|aventura familiar|drama familiar/.test(
      text,
    )
  ) {
    return "familia";
  }

  if (
    /accion|acción|action|aventura|thriller|guerra|fight|combat|polic|crimen|western|ciencia fic|sci-fi|espacio|jeric|cerbero/.test(
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
  const titulo = cleanSpanishMovieTitle(video.title);
  return {
    id: `es-${video.id}`,
    titulo: titulo || video.title.slice(0, 80),
    sinopsis:
      video.desc.slice(0, 240) ||
      `Película completa en español (${year}). HD vía YouTube.`,
    portada: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    categoria,
    youtubeId: video.id,
    fuente: "spanish-cinema",
    idioma: "es",
    anio: `${year}-${month}`,
  };
}

/** Películas en español — solo las verificadas como reproducibles en YouTube. */
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
      if (!isHdOrRecent(video)) continue;

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

  const candidates = [...byId.values()]
    .map(({ video, categoria }) => toContentItem(video, categoria))
    .sort((a, b) => (b.anio ?? "").localeCompare(a.anio ?? ""))
    .slice(0, 40);

  if (candidates.length === 0) return [];

  const playable = await filterPlayableIds(
    candidates.map((item) => item.youtubeId!),
    5,
  );

  return candidates.filter((item) => playable.has(item.youtubeId!)).slice(0, 25);
}
