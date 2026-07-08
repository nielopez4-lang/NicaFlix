const CAST_SCRIPT =
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";

let castInitPromise: Promise<boolean> | null = null;

function loadCastScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.cast?.framework) return Promise.resolve(true);

  if (castInitPromise) return castInitPromise;

  castInitPromise = new Promise((resolve) => {
    window.__onGCastApiAvailable = (available) => resolve(available);

    if (document.querySelector(`script[src="${CAST_SCRIPT}"]`)) {
      const poll = setInterval(() => {
        if (window.cast?.framework) {
          clearInterval(poll);
          resolve(true);
        }
      }, 200);
      return;
    }

    const tag = document.createElement("script");
    tag.src = CAST_SCRIPT;
    tag.async = true;
    tag.onerror = () => resolve(false);
    document.head.appendChild(tag);
  });

  return castInitPromise;
}

async function ensureCastContext(): Promise<cast.framework.CastContext | null> {
  const available = await loadCastScript();
  if (!available || !window.cast?.framework) return null;

  const ctx = cast.framework.CastContext.getInstance();
  ctx.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });
  return ctx;
}

function streamContentType(url: string): string {
  if (url.includes(".m3u8")) return "application/x-mpegURL";
  if (url.includes(".mpd")) return "application/dash+xml";
  return "video/mp4";
}

function streamType(url: string): chrome.cast.media.StreamType {
  if (/\.m3u8|live|envivo|stream/i.test(url)) {
    return chrome.cast.media.StreamType.LIVE;
  }
  return chrome.cast.media.StreamType.BUFFERED;
}

export async function castStreamToTv(
  streamUrl: string,
  titulo: string,
  poster?: string,
): Promise<void> {
  const ctx = await ensureCastContext();
  if (!ctx) throw new Error("cast-unavailable");

  let session = ctx.getCurrentSession();
  if (!session) session = await ctx.requestSession();

  const mediaInfo = new chrome.cast.media.MediaInfo(
    streamUrl,
    streamContentType(streamUrl),
  );
  mediaInfo.streamType = streamType(streamUrl);
  const metadata = new chrome.cast.media.GenericMediaMetadata();
  metadata.title = titulo;
  if (poster) {
    metadata.images = [new chrome.cast.media.Image(poster)];
  }
  mediaInfo.metadata = metadata;

  await new Promise<void>((resolve, reject) => {
    session!.loadMedia(
      new chrome.cast.media.LoadRequest(mediaInfo),
      () => resolve(),
      (err) => reject(err),
    );
  });
}

export async function promptVideoRemotePlayback(
  video: HTMLVideoElement,
): Promise<boolean> {
  if (video.remote?.prompt) {
    await video.remote.prompt();
    return true;
  }
  return false;
}

export async function shareToTv(
  titulo: string,
  url: string,
): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: titulo, text: titulo, url });
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export async function isCastSdkAvailable(): Promise<boolean> {
  return loadCastScript();
}
