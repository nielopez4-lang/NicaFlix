import type Hls from "hls.js";

export type AttachHlsOptions = {
  url: string;
  video: HTMLVideoElement;
  onReady?: () => void;
  onFatalError?: () => void;
  onNetworkRetry?: () => void;
};

/** Configura hls.js con reintentos para streams en vivo estables. */
export async function attachLiveHls({
  url,
  video,
  onReady,
  onFatalError,
  onNetworkRetry,
}: AttachHlsOptions): Promise<Hls | null> {
  const HlsModule = (await import("hls.js")).default;

  if (!HlsModule.isSupported()) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      onReady?.();
    }
    return null;
  }

  const hls = new HlsModule({
    enableWorker: typeof Worker !== "undefined",
    lowLatencyMode: false,
    maxBufferLength: 45,
    maxMaxBufferLength: 90,
    manifestLoadingMaxRetry: 6,
    manifestLoadingRetryDelay: 1000,
    levelLoadingMaxRetry: 6,
    fragLoadingMaxRetry: 8,
    fragLoadingRetryDelay: 1000,
  });

  hls.loadSource(url);
  hls.attachMedia(video);

  hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
    onReady?.();
  });

  hls.on(HlsModule.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;

    if (data.type === HlsModule.ErrorTypes.NETWORK_ERROR) {
      onNetworkRetry?.();
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
