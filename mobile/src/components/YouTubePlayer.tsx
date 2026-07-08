import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  youtubeId: string;
};

export function YouTubePlayer({ youtubeId }: Props) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        allowsFullscreenVideo
        allowsAirPlayForMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
});
