import type { ContentItem } from "@/types/content";

type ArchiveDoc = {
  identifier: string;
  title?: string;
  description?: string;
};

type ArchiveFile = { name: string; size?: string };

function stripHtml(text?: string): string | undefined {
  if (!text) return undefined;
  return text.replace(/<[^>]+>/g, "").trim();
}

function rankMp4Files(files: ArchiveFile[]): ArchiveFile[] {
  return [...files].sort((a, b) => {
    const score = (name: string) => {
      let s = 0;
      if (name.includes("_512kb")) s -= 100;
      if (name.endsWith(".ia.mp4")) s -= 10;
      if (/720|1080|hd/i.test(name)) s += 5;
      return s;
    };
    return score(b.name) - score(a.name);
  });
}

async function verifyStreamUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      next: { revalidate: 86400 },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function getMp4Url(identifier: string): Promise<string | null> {
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const meta = await res.json();
    const candidates = rankMp4Files(
      (meta.files ?? []).filter(
        (f: ArchiveFile) =>
          f.name.endsWith(".mp4") && !f.name.includes("_512kb"),
      ),
    );

    for (const file of candidates.slice(0, 2)) {
      const url = `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`;
      if (await verifyStreamUrl(url)) return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function docsToItems(
  docs: ArchiveDoc[],
  categoria: ContentItem["categoria"],
  prefix: string,
): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (const doc of docs.slice(0, 10)) {
    const streamUrl = await getMp4Url(doc.identifier);
    if (!streamUrl) continue;
    const title = (doc.title ?? doc.identifier).slice(0, 80);
    items.push({
      id: `${prefix}-${doc.identifier}`,
      titulo: title,
      sinopsis:
        stripHtml(doc.description)?.slice(0, 200) ??
        "Contenido de dominio público — Internet Archive",
      portada: `https://archive.org/services/img/${doc.identifier}`,
      streamUrl,
      categoria,
      fuente: "archive",
    });
  }
  return items;
}

async function fetchArchiveQuery(
  q: string,
  categoria: ContentItem["categoria"],
  prefix: string,
): Promise<ContentItem[]> {
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=description&rows=16&output=json`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return docsToItems(data.response?.docs ?? [], categoria, prefix);
}

export async function fetchArchiveCatalog(): Promise<ContentItem[]> {
  const queries = [
    {
      q: "mediatype:movies AND collection:feature_films AND (language:Spanish OR language:spa OR title:español OR title:espanol)",
      categoria: "peliculas" as const,
      prefix: "m",
    },
    {
      q: "mediatype:movies AND collection:feature_films",
      categoria: "peliculas" as const,
      prefix: "m",
    },
    {
      q: "mediatype:movies AND subject:television",
      categoria: "series" as const,
      prefix: "s",
    },
    {
      q: "mediatype:movies AND subject:animation",
      categoria: "kids" as const,
      prefix: "k",
    },
  ];

  const seen = new Set<string>();
  const items: ContentItem[] = [];
  let peliculaCount = 0;

  for (const { q, categoria, prefix } of queries) {
    if (categoria === "peliculas" && peliculaCount >= 10) continue;

    const batch = await fetchArchiveQuery(q, categoria, prefix);
    for (const item of batch) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      if (item.categoria === "peliculas") {
        peliculaCount += 1;
        if (peliculaCount >= 10) break;
      }
    }
  }

  return items;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseYoutubeTrailer(trailer?: {
  youtube_id?: string | null;
  embed_url?: string | null;
}): string | undefined {
  if (trailer?.youtube_id) return trailer.youtube_id;
  const embed = trailer?.embed_url ?? "";
  const match = embed.match(/\/embed\/([^?&/]+)/);
  return match?.[1];
}

async function fetchAnimeTrailerId(malId: number): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return parseYoutubeTrailer(json.data?.trailer);
  } catch {
    return undefined;
  }
}

export async function fetchJikanAnime(): Promise<ContentItem[]> {
  const res = await fetch(
    "https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&limit=20",
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];

  const data = await res.json();
  const rows: Array<{
    mal_id: number;
    title: string;
    synopsis?: string;
    images: { jpg: { large_image_url: string } };
    trailer?: { youtube_id?: string | null; embed_url?: string | null };
  }> = data.data ?? [];

  const pending = rows.map((a) => ({
    a,
    youtubeId: parseYoutubeTrailer(a.trailer),
  }));

  for (let i = 0; i < pending.length; i += 3) {
    const chunk = pending.slice(i, i + 3).filter((entry) => !entry.youtubeId);
    if (!chunk.length) continue;

    await Promise.all(
      chunk.map(async (entry) => {
        entry.youtubeId = await fetchAnimeTrailerId(entry.a.mal_id);
      }),
    );

    if (i + 3 < pending.length) await sleep(450);
  }

  return pending
    .filter((entry) => entry.youtubeId)
    .map(({ a, youtubeId }) => ({
      id: `a-${a.mal_id}`,
      titulo: a.title,
      sinopsis: stripHtml(a.synopsis)?.slice(0, 200) ?? "Anime popular",
      portada: a.images.jpg.large_image_url,
      youtubeId: youtubeId!,
      categoria: "anime" as const,
      fuente: "jikan" as const,
    }));
}
