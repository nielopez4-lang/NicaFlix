import type { ContentItem } from "../../../shared/types";

type ArchiveDoc = {
  identifier: string;
  title?: string;
  description?: string;
};

async function getMp4Url(identifier: string): Promise<string | null> {
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const meta = await res.json();
    const mp4 = meta.files?.find(
      (f: { name: string }) =>
        f.name.endsWith(".mp4") && !f.name.includes("_512kb"),
    );
    if (!mp4) return null;
    return `https://archive.org/download/${identifier}/${encodeURIComponent(mp4.name)}`;
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
  for (const doc of docs.slice(0, 8)) {
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
    });
  }
  return items;
}

function stripHtml(text?: string): string | undefined {
  if (!text) return undefined;
  return text.replace(/<[^>]+>/g, "").trim();
}

export async function fetchArchiveCatalog(): Promise<ContentItem[]> {
  const queries = [
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

  const results = await Promise.all(
    queries.map(async ({ q, categoria, prefix }) => {
      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=description&rows=12&output=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();
      return docsToItems(data.response?.docs ?? [], categoria, prefix);
    }),
  );

  return results.flat();
}

export async function fetchJikanAnime(): Promise<ContentItem[]> {
  const res = await fetch(
    "https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&limit=25",
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data ?? []).map(
    (a: {
      mal_id: number;
      title: string;
      synopsis?: string;
      images: { jpg: { large_image_url: string } };
      trailer?: { youtube_id?: string };
    }) => ({
      id: `a-${a.mal_id}`,
      titulo: a.title,
      sinopsis: stripHtml(a.synopsis)?.slice(0, 200) ?? "Anime popular",
      portada: a.images.jpg.large_image_url,
      youtubeId: a.trailer?.youtube_id,
      categoria: "anime" as const,
    }),
  );
}
