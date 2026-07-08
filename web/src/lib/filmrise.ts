import type { Categoria, ContentItem } from "@/types/content";

const FILMRISE_MOVIES_CHANNEL = "UCU4BHh9Dwfd7-I_xTZ5037Q";

/** Playlists del canal FilmRise Movies (YouTube RSS) */
const FILMRISE_PLAYLISTS = [
  "PLYCGB2FR2jUqY6lR-Iz4cFAyf2M-HyihM",
  "PLYCGB2FR2jUoTPLYDjh-f3C7G37PYXUcI",
  "PLYCGB2FR2jUoQJ5A6qqxsoqUYQ8jaz96E",
  "PLYCGB2FR2jUptGuh7VJGqj0cXsHRm29As",
  "PLYCGB2FR2jUpZewMIgBI48xhvhosT1O4t",
  "PLYCGB2FR2jUqtU0BO8tkJ82X5XcB8yfcH",
  "PLYCGB2FR2jUrTT1GzkzSvW3YZOLxY0lC-",
];

type RssVideo = {
  id: string;
  title: string;
  published: string;
  desc: string;
};

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseRssVideos(xml: string): RssVideo[] {
  return xml
    .split("<entry>")
    .slice(1)
    .map((block) => ({
      id: block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "",
      title: decodeXml(block.match(/<title>([^<]+)<\/title>/)?.[1] ?? ""),
      published: block.match(/<published>([^<]+)<\/published>/)?.[1] ?? "",
      desc: decodeXml(
        block.match(/<media:description>([^<]*)<\/media:description>/)?.[1] ??
          "",
      ),
    }))
    .filter((v) => v.id.length === 11);
}

function isFullMovie(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  return /full movie|full film|pel[ií]cula completa|pelicula completa/.test(
    text,
  );
}

function isSpanish(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  return /español|espanol|latino|castellano|doblado|subtitulado en español| en es\b/.test(
    text,
  );
}

function classifyGenre(video: RssVideo): Categoria {
  const text = `${video.title} ${video.desc}`.toLowerCase();

  if (
    /horror|terror|scary|zombie|vampire|ghost|haunt|slasher|miedo|demon|witch|nightmare|frankenstein|evil killer|true crime|forensic|murder mystery|killer|serial killer|unsolved mysteries|crimes of passion|victim of love|sleepwalker|sextortion|scam|documentary.*kill|little miss magic|billy frankenstein/.test(
      text,
    )
  ) {
    return "terror";
  }

  if (
    /comedy|comedia|funny|laugh|stand.?up|humor|risa|hilar|hoser|dunning man|sheryl underwood|party girl|american hero|too much information/.test(
      text,
    )
  ) {
    return "comedia";
  }

  if (
    /family|familia|kids|child|infantil|dinotopia|cool dog|adventure|coming of age|lymelife|white coats|school|young|mee-shee|water giant|northern borders|father's shoes|lily dale|in his father|journey to the center|teen|innocent|magic/.test(
      text,
    )
  ) {
    return "familia";
  }

  if (
    /action|acción|accion|war|guerra|fight|martial|hero|statham|van damme|cage|thriller|survivor|blitz|agent|gun|battle|combat|military|soldier|cop|police|heist|revenge|assassin|spy|shark|dolph lundgren|brendan fraser|guilty until|run for the dream|nurses on the line|crash|drama|betrayal|charade|dirty filthy|izzy|moe|western|running wild|dayton/.test(
      text,
    )
  ) {
    return "accion";
  }

  return "accion";
}

async function fetchRss(url: string): Promise<RssVideo[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NicaFlix/1.0; +https://web-five-plum-og6kinpc9v.vercel.app)",
      },
    });
    if (!res.ok) return [];
    return parseRssVideos(await res.text());
  } catch {
    return [];
  }
}

function toContentItem(video: RssVideo, categoria: Categoria): ContentItem {
  const es = isSpanish(video);
  const year = video.published.slice(0, 4);
  return {
    id: `fr-${video.id}`,
    titulo: video.title.replace(/\s*-\s*Full Movie.*$/i, "").trim(),
    sinopsis:
      video.desc.slice(0, 220) ||
      `Película completa de FilmRise (${year}). Streaming oficial vía YouTube.`,
    portada: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    categoria,
    youtubeId: video.id,
    fuente: "filmrise",
    idioma: es ? "es" : "multi",
    anio: year,
  };
}

export async function fetchFilmRiseCatalog(): Promise<ContentItem[]> {
  const feeds = [
    `https://www.youtube.com/feeds/videos.xml?channel_id=${FILMRISE_MOVIES_CHANNEL}`,
    ...FILMRISE_PLAYLISTS.map(
      (id) => `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`,
    ),
  ];

  const batches = await Promise.all(feeds.map((url) => fetchRss(url)));
  const byId = new Map<string, { video: RssVideo; categoria: Categoria }>();

  for (const videos of batches) {
    for (const video of videos) {
      if (!isFullMovie(video)) continue;
      const categoria = classifyGenre(video);
      const existing = byId.get(video.id);
      if (!existing) {
        byId.set(video.id, { video, categoria });
        continue;
      }
      if (existing.categoria === "accion" && categoria !== "accion") {
        existing.categoria = categoria;
      }
      if (
        new Date(video.published).getTime() >
        new Date(existing.video.published).getTime()
      ) {
        existing.video = video;
      }
    }
  }

  const items = [...byId.values()]
    .map(({ video, categoria }) => toContentItem(video, categoria))
    .sort((a, b) => {
      const esA = a.idioma === "es" ? 1 : 0;
      const esB = b.idioma === "es" ? 1 : 0;
      if (esB !== esA) return esB - esA;
      return (b.anio ?? "").localeCompare(a.anio ?? "");
    });

  return items;
}
