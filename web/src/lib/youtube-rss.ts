export type RssVideo = {
  id: string;
  title: string;
  published: string;
  desc: string;
};

export function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseRssVideos(xml: string): RssVideo[] {
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

export async function fetchYoutubeRss(url: string): Promise<RssVideo[]> {
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
