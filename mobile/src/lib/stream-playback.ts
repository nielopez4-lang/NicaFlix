import { getExpoEnv } from "@/lib/env";

const WEB_URL =
  getExpoEnv("EXPO_PUBLIC_WEB_URL") ||
  getExpoEnv("EXPO_PUBLIC_API_URL") ||
  "https://web-five-plum-og6kinpc9v.vercel.app";

const HTTPS_UPGRADE_HOSTS = ["canal.mediaserver.com.co"];

function upgradeToHttps(url: string): string {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "http:" &&
      HTTPS_UPGRADE_HOSTS.some((h) => parsed.hostname === h)
    ) {
      parsed.protocol = "https:";
      return parsed.toString();
    }
  } catch {
    /* ignore */
  }
  return url;
}

const DAILYMOTION_PREFIX = "dailymotion:";
const DAILYMOTION_EMBED_PREFIX = "dm-embed:";

function toDailyMotionEmbedUrl(videoId: string): string {
  return `https://www.dailymotion.com/embed/video/${encodeURIComponent(videoId)}?autoplay=1&ui-start-screen-info=0&queue-enable=0`;
}

function isStreamResource(url: string): boolean {
  return (
    /\.(m3u8|ts|m4s|mp4)(\?|$)/i.test(url) ||
    url.includes(".m3u8") ||
    url.includes("/api/dailymotion") ||
    url.includes("/api/hls")
  );
}

/** Misma lógica que web: HTTP / DailyMotion → APIs en el servidor NicaFlix. */
export function normalizeStreamUrl(streamUrl: string): string {
  if (streamUrl.startsWith(DAILYMOTION_EMBED_PREFIX)) {
    return toDailyMotionEmbedUrl(
      streamUrl.slice(DAILYMOTION_EMBED_PREFIX.length).trim(),
    );
  }

  if (streamUrl.startsWith(DAILYMOTION_PREFIX)) {
    const id = streamUrl.slice(DAILYMOTION_PREFIX.length).trim();
    const base = WEB_URL.replace(/\/$/, "");
    return `${base}/api/dailymotion?video=${encodeURIComponent(id)}`;
  }

  if (!streamUrl.startsWith("http")) return streamUrl;

  const upgraded = upgradeToHttps(streamUrl);
  if (upgraded.startsWith("https://")) return upgraded;

  if (!isStreamResource(streamUrl)) return streamUrl;

  const base = WEB_URL.replace(/\/$/, "");
  return `${base}/api/hls?url=${encodeURIComponent(streamUrl)}`;
}

export { WEB_URL };
