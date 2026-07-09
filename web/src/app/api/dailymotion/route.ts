import {
  fetchDailyMotionManifestUrl,
  parseDailyMotionVideoId,
} from "@/lib/dailymotion-live";
import { rewriteM3u8Playlist } from "@/lib/stream-playback";

export const dynamic = "force-dynamic";

/** Resuelve m3u8 de DailyMotion (tokens cortos) para canales oficiales en vivo. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId =
    parseDailyMotionVideoId(searchParams.get("video") ?? "") ??
    searchParams.get("video");

  if (!videoId || !/^[\w-]+$/.test(videoId)) {
    return new Response("Video no válido", { status: 400 });
  }

  try {
    const manifestUrl = await fetchDailyMotionManifestUrl(videoId);
    if (!manifestUrl) {
      return new Response("Stream no disponible", { status: 404 });
    }

    const upstream = await fetch(manifestUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return new Response(`Upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const text = await upstream.text();
    const rewritten = rewriteM3u8Playlist(text, manifestUrl);

    return new Response(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Error al cargar stream", { status: 502 });
  }
}
