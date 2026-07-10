import { getAdEmbedUrl, VIDEO_AD } from "@/lib/monetag";
import { MONETAG_ZONES } from "@/lib/monetag-zones";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  visible: boolean;
  kind?: "preroll" | "midroll";
  onComplete: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
};

/** Pantalla 50/50 estilo NBC Playing Through — video + anuncio sin pausar. */
export function SplitScreenAdGate({
  visible,
  kind = "midroll",
  onComplete,
  children,
  style,
}: Props) {
  const isMidroll = kind === "midroll";
  const [seconds, setSeconds] = useState(
    isMidroll ? VIDEO_AD.midrollDisplaySec : VIDEO_AD.prerollSeconds,
  );

  useEffect(() => {
    if (!visible) return;
    setSeconds(
      isMidroll ? VIDEO_AD.midrollDisplaySec : VIDEO_AD.prerollSeconds,
    );
  }, [visible, kind, isMidroll]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, seconds]);

  useEffect(() => {
    if (!visible || !isMidroll) return;
    const t = setTimeout(onComplete, VIDEO_AD.midrollDisplaySec * 1000);
    return () => clearTimeout(t);
  }, [visible, isMidroll, onComplete]);

  if (!visible) {
    return <View style={[styles.wrap, style]}>{children}</View>;
  }

  const prerollReady = !isMidroll && seconds <= 0;
  const adHeight = isMidroll ? 320 : 200;
  const embedUrl = getAdEmbedUrl(
    isMidroll ? MONETAG_ZONES.PLAYER_BOTTOM : MONETAG_ZONES.PREROLL,
    adHeight,
  );

  if (isMidroll) {
    return (
      <View style={[styles.split, style]}>
        <View style={styles.playerPane}>
          <View style={styles.playingThroughBar}>
            <Text style={styles.playingThroughText}>TU PROGRAMA CONTINÚA</Text>
          </View>
          <View style={styles.playerContent}>{children}</View>
        </View>
        <View style={styles.adPaneMidroll}>
          <Text style={styles.adTimer}>Anuncio · {seconds}s</Text>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.adWebMidroll}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
          />
          <Pressable style={styles.btnDismiss} onPress={onComplete}>
            <Text style={styles.btnDismissText}>Ocultar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.split, style]}>
      <View style={styles.playerPane}>{children}</View>
      <View style={styles.adPane}>
        <Text style={styles.adLabel}>Anuncio · preparando reproducción</Text>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.adWeb}
          javaScriptEnabled
          domStorageEnabled
        />
        {!prerollReady ? (
          <Text style={styles.counter}>{seconds}</Text>
        ) : null}
        <Pressable
          style={[styles.btn, !prerollReady && styles.btnDisabled]}
          disabled={!prerollReady}
          onPress={onComplete}
        >
          <Text style={styles.btnText}>
            {prerollReady ? "Comenzar a ver" : `Espera ${seconds}s`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  split: {
    width: "100%",
    minHeight: 280,
    flexDirection: "row",
  },
  playerPane: {
    flex: 1,
    minHeight: 200,
    backgroundColor: "#000",
  },
  playingThroughBar: {
    backgroundColor: "rgba(82,82,82,0.95)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  playingThroughText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  playerContent: { flex: 1, minHeight: 160 },
  adPaneMidroll: {
    flex: 1,
    backgroundColor: "#000",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.1)",
    minHeight: 200,
  },
  adTimer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adWebMidroll: { flex: 1, minHeight: 180 },
  btnDismiss: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnDismissText: { color: "#fff", fontSize: 11 },
  adPane: {
    flex: 1,
    backgroundColor: "#0f0f14",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
    padding: 10,
    minHeight: 200,
  },
  adLabel: { color: "#8B8B9A", fontSize: 11, marginBottom: 8 },
  adWeb: { flex: 1, minHeight: 100, borderRadius: 12, overflow: "hidden" },
  counter: {
    color: "#E50914",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 8,
  },
  btn: {
    backgroundColor: "#E50914",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
