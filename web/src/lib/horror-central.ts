import type { ContentItem } from "@/types/content";
import { filterPlayableIds } from "@/lib/youtube-embed";

/** Playlist: PELÍCULAS COMPLETAS EN ESPAÑOL */
const HORROR_ES_PLAYLIST = "PLuh7PPu5CNS9eoBivnV_eze85iPao9UcD";

/** Canal Central Terror — subidas recientes en español */
const HORROR_CHANNEL_ID = "UCZ1SEglncZ8j3v7gygwH_gg";

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

function isSpanishHorror(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  return (
    /español|espanol|latino|castellano|doblado|subtitulado/.test(text) ||
    /pel[ií]cula completa|pelicula completa/.test(text)
  );
}

function isFullHorrorMovie(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  return (
    /pel[ií]cula completa|pelicula completa|full movie|full film/.test(text) ||
    /terror|horror|miedo|suspenso/.test(text)
  );
}

function isHdQuality(video: RssVideo): boolean {
  const text = `${video.title} ${video.desc}`.toLowerCase();
  return /1080|720|hd|4k|alta definici/i.test(text) || text.length > 0;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*Pel[ií]cula.*$/i, "")
    .replace(/\s*-\s*Pel[ií]cula.*$/i, "")
    .replace(/\s*\(HD\)\s*/i, "")
    .trim();
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

function toContentItem(video: RssVideo): ContentItem {
  const year = video.published.slice(0, 4);
  return {
    id: `hc-${video.id}`,
    titulo: cleanTitle(video.title),
    sinopsis:
      video.desc.slice(0, 240) ||
      `Película de terror en español (${year}). Central de Películas - TERROR & HORROR · YouTube.`,
    portada: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    categoria: "terror",
    youtubeId: video.id,
    fuente: "horror-central",
    idioma: "es",
    anio: year,
  };
}

export async function fetchHorrorCentralCatalog(): Promise<ContentItem[]> {
  const feeds = [
    `https://www.youtube.com/feeds/videos.xml?channel_id=${HORROR_CHANNEL_ID}`,
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${HORROR_ES_PLAYLIST}`,
  ];

  const batches = await Promise.all(feeds.map((url) => fetchRss(url)));
  const byId = new Map<string, RssVideo>();

  for (const videos of batches) {
    for (const video of videos) {
      if (!isFullHorrorMovie(video) || !isSpanishHorror(video)) continue;
      if (!isHdQuality(video)) continue;
      const existing = byId.get(video.id);
      if (
        !existing ||
        new Date(video.published).getTime() >
          new Date(existing.published).getTime()
      ) {
        byId.set(video.id, video);
      }
    }
  }

  const candidates = [...byId.values()]
    .map(toContentItem)
    .sort((a, b) => (b.anio ?? "").localeCompare(a.anio ?? ""))
    .slice(0, 35);

  if (candidates.length === 0) return [];

  const playable = await filterPlayableIds(
    candidates.map((item) => item.youtubeId!),
    5,
  );

  return candidates.filter((item) => playable.has(item.youtubeId!));
}
