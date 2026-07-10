import type Hls from "hls.js";

export type AttachHlsOptions = {
  url: string;
  video: HTMLVideoElement;
  onReady?: () => void;
  onFatalError?: () => void;
};

const MAX_NETWORK_RETRIES = 4;

/** Configura hls.js con reintentos limitados para streams en vivo. */
export async function attachLiveHls({
  url,
  video,
  onReady,
  onFatalError,
}: AttachHlsOptions): Promise<Hls | null> {
  const HlsModule = (await import("hls.js")).default;

  if (!HlsModule.isSupported()) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("canplay", () => onReady?.(), { once: true });
    }
    return null;
  }

  let networkRetries = 0;
  let ready = false;

  const markReady = () => {
    if (ready) return;
    ready = true;
    onReady?.();
  };

  const hls = new HlsModule({
    enableWorker: false,
    lowLatencyMode: false,
    maxBufferLength: 30,
    manifestLoadingMaxRetry: 4,
    levelLoadingMaxRetry: 4,
    fragLoadingMaxRetry: 6,
  });

  hls.loadSource(url);
  hls.attachMedia(video);

  hls.on(HlsModule.Events.MANIFEST_PARSED, markReady);
  hls.on(HlsModule.Events.LEVEL_LOADED, markReady);

  video.addEventListener("canplay", markReady, { once: true });

  hls.on(HlsModule.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;

    if (data.type === HlsModule.ErrorTypes.NETWORK_ERROR) {
      networkRetries += 1;
      if (networkRetries >= MAX_NETWORK_RETRIES) {
        hls.destroy();
        onFatalError?.();
        return;
      }
      hls.startLoad();
      return;
    }

    if (data.type === HlsModule.ErrorTypes.MEDIA_ERROR) {
      hls.recoverMediaError();
      return;
    }

    hls.destroy();
    onFatalError?.();
  });

  return hls;
}
