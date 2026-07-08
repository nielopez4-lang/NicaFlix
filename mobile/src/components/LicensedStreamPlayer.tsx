import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  streamUrl: string;
  titulo: string;
};

/**
 * Reproductor para streams con URL y licencia válida (HLS/DASH/embed).
 * Usa URLs que tengas derecho a distribuir — no reempaqueta fuentes sin permiso.
 */
export function LicensedStreamPlayer({ streamUrl, titulo }: Props) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          video { width: 100%; max-height: 100vh; }
        </style>
      </head>
      <body>
        <video controls autoplay playsinline src="${streamUrl}"></video>
      </body>
    </html>
  `;

  return (
    <View style={styles.container} accessibilityLabel={titulo}>
      <WebView
        source={{ html }}
        allowsFullscreenVideo
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
