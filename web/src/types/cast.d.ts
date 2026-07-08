/** Minimal Chromecast CAF Sender types for web casting. */
declare namespace chrome {
  namespace cast {
    enum AutoJoinPolicy {
      ORIGIN_SCOPED = "origin_scoped",
    }

    enum SessionState {
      SESSION_STARTED = "SESSION_STARTED",
    }

    interface Session {
      loadMedia(
        request: media.LoadRequest,
        successCallback?: () => void,
        errorCallback?: (error: Error) => void,
      ): void;
    }

    namespace media {
      enum StreamType {
        BUFFERED = "BUFFERED",
        LIVE = "LIVE",
      }

      class Image {
        constructor(url: string);
      }

      class GenericMediaMetadata {
        title?: string;
        images?: Image[];
      }

      class MediaInfo {
        constructor(contentId: string, contentType: string);
        streamType: StreamType;
        metadata: GenericMediaMetadata;
      }

      class LoadRequest {
        constructor(mediaInfo: MediaInfo);
      }

      const DEFAULT_MEDIA_RECEIVER_APP_ID: string;
    }
  }
}

declare namespace cast {
  namespace framework {
    enum CastContextEventType {
      CAST_STATE_CHANGED = "caststatechanged",
    }

    enum CastState {
      NO_DEVICES_AVAILABLE = "NO_DEVICES_AVAILABLE",
      NOT_CONNECTED = "NOT_CONNECTED",
      CONNECTING = "CONNECTING",
      CONNECTED = "CONNECTED",
    }

    class CastContext {
      static getInstance(): CastContext;
      setOptions(options: {
        receiverApplicationId: string;
        autoJoinPolicy: chrome.cast.AutoJoinPolicy;
      }): void;
      getCastState(): CastState;
      requestSession(): Promise<chrome.cast.Session>;
      getCurrentSession(): chrome.cast.Session | null;
      addEventListener(
        type: CastContextEventType,
        listener: () => void,
      ): void;
      removeEventListener(
        type: CastContextEventType,
        listener: () => void,
      ): void;
    }
  }
}

interface Window {
  __onGCastApiAvailable?: (isAvailable: boolean) => void;
}

interface RemotePlayback {
  state: "connecting" | "connected" | "disconnected";
  prompt(): Promise<void>;
}

interface HTMLMediaElement {
  remote?: RemotePlayback;
}
