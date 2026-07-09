import { getAdEmbedUrl, openDirectLink, VIDEO_AD } from "@/lib/monetag";
import { MONETAG_ZONES } from "@/lib/monetag-zones";
import { useEffect, useRef, useState } from "react";
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

export function SplitScreenAdGate({
  visible,
  kind = "midroll",
  onComplete,
  children,
  style,
}: Props) {
  const [seconds, setSeconds] = useState(VIDEO_AD.prerollSeconds);
  const linkOpened = useRef(false);

  useEffect(() => {
    if (!visible) {
      linkOpened.current = false;
      return;
    }
    setSeconds(VIDEO_AD.prerollSeconds);
  }, [visible, kind]);

  useEffect(() => {
    if (!visible || linkOpened.current) return;
    linkOpened.current = true;
    openDirectLink();
  }, [visible]);

  useEffect(() => {
    if (!visible || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, seconds]);

  if (!visible) {
    return <View style={[styles.wrap, style]}>{children}</View>;
  }

  const ready = seconds <= 0;
  const embedUrl = getAdEmbedUrl(MONETAG_ZONES.PREROLL, 180);

  return (
    <View style={[styles.split, style]}>
      <View style={styles.playerPane}>{children}</View>
      <View style={styles.adPane}>
        <Text style={styles.adLabel}>
          {kind === "preroll"
            ? "Anuncio · preparando reproducción"
            : "Pausa publicitaria · cada 15 min"}
        </Text>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.adWeb}
          javaScriptEnabled
          domStorageEnabled
        />
        {!ready ? (
          <Text style={styles.counter}>{seconds}</Text>
        ) : null}
        <Pressable
          style={[styles.btn, !ready && styles.btnDisabled]}
          disabled={!ready}
          onPress={onComplete}
        >
          <Text style={styles.btnText}>
            {ready ? "Continuar viendo" : `Espera ${seconds}s`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  split: { width: "100%", minHeight: 420 },
  playerPane: { minHeight: 200, backgroundColor: "#000" },
  adPane: {
    flex: 1,
    backgroundColor: "#0f0f14",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    padding: 12,
    minHeight: 220,
  },
  adLabel: { color: "#8B8B9A", fontSize: 11, marginBottom: 8 },
  adWeb: { flex: 1, minHeight: 120, borderRadius: 12, overflow: "hidden" },
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
