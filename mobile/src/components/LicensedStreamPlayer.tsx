import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  streamUrl: string;
  titulo: string;
};

function isDirectMedia(url: string): boolean {
  return /\.(mp4|webm|mpd)(\?|$)/i.test(url);
}

function isHlsPlayback(url: string): boolean {
  return (
    url.includes(".m3u8") ||
    url.includes("/api/hls") ||
    url.includes("/api/dailymotion")
  );
}

/**
 * Reproductor para streams con URL y licencia válida (HLS/DASH/embed).
 * Usa URLs que tengas derecho a distribuir — no reempaqueta fuentes sin permiso.
 */
export function LicensedStreamPlayer({ streamUrl, titulo }: Props) {
  if (!isDirectMedia(streamUrl) && !isHlsPlayback(streamUrl)) {
    return (
      <View style={styles.container} accessibilityLabel={titulo}>
        <WebView
          source={{ uri: streamUrl }}
          allowsFullscreenVideo
          allowsAirPlayForMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          video { width: 100%; max-height: 100vh; }
        </style>
      </head>
      <body>
        <video id="v" controls autoplay playsinline webkit-playsinline x-webkit-airplay="allow"></video>
        <script>
          const src = ${JSON.stringify(streamUrl)};
          const video = document.getElementById("v");
          if (src.includes(".m3u8") || src.includes("/api/hls") || src.includes("/api/dailymotion")) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = src;
            } else if (window.Hls && Hls.isSupported()) {
              const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
              hls.loadSource(src);
              hls.attachMedia(video);
            } else {
              video.src = src;
            }
          } else {
            video.src = src;
          }
          video.play().catch(function(){});
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container} accessibilityLabel={titulo}>
      <WebView
        source={{ html }}
        allowsFullscreenVideo
        allowsAirPlayForMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
