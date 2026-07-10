import {
  DAILYMOTION_EMBED_PREFIX,
  DAILYMOTION_PREFIX,
  isDailyMotionEmbedUrl,
  isDailyMotionStreamUrl,
  toDailyMotionEmbedUrl,
  toDailyMotionPlaybackUrl,
} from "@/lib/dailymotion-live";
import { SITE_URL } from "@/lib/monetag-config";

export {
  DAILYMOTION_EMBED_PREFIX,
  DAILYMOTION_PREFIX,
  isDailyMotionEmbedUrl,
  isDailyMotionStreamUrl,
};

/** Solo URLs embebibles en iframe (evita páginas web que bloquean embed). */
export function isKnownEmbedUrl(url: string): boolean {
  if (isDailyMotionEmbedUrl(url)) return true;
  try {
    const { hostname } = new URL(url);
    if (
      /(?:^|\.)dailymotion\.com$|(?:^|\.)youtube\.com$|(?:^|\.)youtu\.be$/.test(
        hostname,
      )
    ) {
      return true;
    }
    // Señal oficial Canal 10 (player web embebible).
    return hostname === "www.canal10.com.ni" || hostname === "canal10.com.ni";
  } catch {
    return false;
  }
}

/** Dominios HTTPS que deben pasar por /api/hls (CORS en el navegador). */
const FORCE_PROXY_HOSTS = ["canal.mediaserver.com.co"];

/** Dominios donde HTTP→HTTPS directo funciona (sin proxy). */
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
  return (
    /\.(m3u8|ts|m4s|mp4)(\?|$)/i.test(url) ||
    url.includes(".m3u8") ||
    url.includes("/api/dailymotion") ||
    url.includes("/api/hls")
  );
}

function shouldUseHlsProxy(url: string): boolean {
  if (!isStreamResource(url)) return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol === "http:") return true;
    return FORCE_PROXY_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

/** URL reproducible en HTTPS (web + app). HTTP / CORS → proxy /api/hls. */
export function toPlaybackStreamUrl(
  streamUrl: string,
  origin: string = SITE_URL,
): string {
  if (streamUrl.startsWith(DAILYMOTION_EMBED_PREFIX)) {
    return toDailyMotionEmbedUrl(
      streamUrl.slice(DAILYMOTION_EMBED_PREFIX.length).trim(),
    );
  }

  if (streamUrl.startsWith(DAILYMOTION_PREFIX)) {
    return toDailyMotionPlaybackUrl(
      streamUrl.slice(DAILYMOTION_PREFIX.length).trim(),
      origin,
    );
  }

  if (!streamUrl.startsWith("http")) return streamUrl;

  const upgraded = upgradeToHttps(streamUrl);
  const playbackTarget = upgraded.startsWith("http") ? upgraded : streamUrl;

  if (shouldUseHlsProxy(streamUrl) || shouldUseHlsProxy(upgraded)) {
    const base = origin.replace(/\/$/, "");
    return `${base}/api/hls?url=${encodeURIComponent(playbackTarget)}`;
  }

  if (upgraded.startsWith("https://")) return upgraded;

  if (!isStreamResource(streamUrl)) return streamUrl;

  const base = origin.replace(/\/$/, "");
  return `${base}/api/hls?url=${encodeURIComponent(streamUrl)}`;
}

export function normalizeStreamUrl(streamUrl: string): string {
  return toPlaybackStreamUrl(upgradeToHttps(streamUrl));
}

export function resolveProxyTarget(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!isStreamResource(parsed.href)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rewriteM3u8Playlist(body: string, playlistUrl: string): string {
  const base = new URL(playlistUrl);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      try {
        const absolute = new URL(trimmed, base).href;
        return toPlaybackStreamUrl(absolute, origin);
      } catch {
        return line;
      }
    })
    .join("\n");
}
