export const DAILYMOTION_PREFIX = "dailymotion:";

export function isDailyMotionStreamUrl(streamUrl: string): boolean {
  return (
    streamUrl.startsWith(DAILYMOTION_PREFIX) ||
    streamUrl.includes("/api/dailymotion")
  );
}

export function toDailyMotionPlaybackUrl(
  videoId: string,
  origin: string,
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/dailymotion?video=${encodeURIComponent(videoId)}`;
}

export function parseDailyMotionVideoId(streamUrl: string): string | null {
  if (streamUrl.startsWith(DAILYMOTION_PREFIX)) {
    const id = streamUrl.slice(DAILYMOTION_PREFIX.length).trim();
    return id || null;
  }
  try {
    const parsed = new URL(streamUrl, "https://local");
    if (parsed.pathname.includes("/api/dailymotion")) {
      return parsed.searchParams.get("video");
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchDailyMotionManifestUrl(
  videoId: string,
): Promise<string | null> {
  const res = await fetch(
    `https://www.dailymotion.com/player/metadata/video/${encodeURIComponent(videoId)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const json = (await res.json()) as {
    qualities?: Record<string, Array<{ url?: string }>>;
  };

  const buckets = ["auto", "720", "480", "380", "240"];
  for (const bucket of buckets) {
    const url = json.qualities?.[bucket]?.[0]?.url;
    if (url) return url;
  }

  for (const entries of Object.values(json.qualities ?? {})) {
    const url = entries?.[0]?.url;
    if (url) return url;
  }

  return null;
}
