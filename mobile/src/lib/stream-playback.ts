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

function isStreamResource(url: string): boolean {
  return /\.(m3u8|ts|m4s|mp4)(\?|$)/i.test(url) || url.includes(".m3u8");
}

/** Misma lógica que web: HTTP → proxy /api/hls en el servidor NicaFlix. */
export function normalizeStreamUrl(streamUrl: string): string {
  if (!streamUrl.startsWith("http")) return streamUrl;

  const upgraded = upgradeToHttps(streamUrl);
  if (upgraded.startsWith("https://")) return upgraded;

  if (!isStreamResource(streamUrl)) return streamUrl;

  const base = WEB_URL.replace(/\/$/, "");
  return `${base}/api/hls?url=${encodeURIComponent(streamUrl)}`;
}

export { WEB_URL };
