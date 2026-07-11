import {
  resolveProxyTarget,
  rewriteM3u8Playlist,
} from "@/lib/stream-playback";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Proxy HLS para streams HTTP en sitio HTTPS (evita mixed content). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = resolveProxyTarget(searchParams.get("url") ?? "");

  if (!target) {
    return new Response("URL no válida", { status: 400 });
  }

  try {
    const upstream = await fetch(target.href, {
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        Referer: target.hostname.includes("cloudfront.net")
          ? "https://www.canal10.com.ni/"
          : target.hostname === "live20.bozztv.com"
            ? "https://live20.bozztv.com/"
          : target.hostname === "45.171.108.253"
            ? "http://45.171.108.253:8888/"
            : target.hostname === "190.122.104.210"
              ? "http://190.122.104.210:5080/"
              : target.hostname === "138.117.4.70"
              ? "http://138.117.4.70:8075/"
              : target.hostname.includes("streamingcws30.com")
                ? "https://streamingcws30.com/"
                : `${target.origin}/`,
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new Response(`Upstream ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const isPlaylist =
      target.pathname.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("m3u");

    if (isPlaylist) {
      const text = await upstream.text();
      const rewritten = rewriteM3u8Playlist(text, target.href);
      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Error al cargar stream", { status: 502 });
  }
}
