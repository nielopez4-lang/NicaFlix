import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  titulo: string;
  streamUrl?: string;
  youtubeId?: string;
};

function watchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function CastToTvButton({ titulo, streamUrl, youtubeId }: Props) {
  const [busy, setBusy] = useState(false);

  const handlePress = useCallback(async () => {
    const url = youtubeId ? watchUrl(youtubeId) : streamUrl;
    if (!url) {
      Alert.alert("Ver en TV", "Este contenido no se puede enviar a la TV.");
      return;
    }

    setBusy(true);
    try {
      await Share.share({
        title: titulo,
        message:
          Platform.OS === "ios"
            ? `${titulo}\n${url}`
            : `${titulo} — ${url}`,
        url: Platform.OS === "ios" ? url : undefined,
      });

      if (youtubeId) {
        Alert.alert(
          "Ver en TV",
          "Abre el enlace en la app de YouTube en tu TV o usa AirPlay / Chromecast desde el reproductor.",
        );
      }
    } catch {
      Alert.alert(
        "Ver en TV",
        youtubeId
          ? "Abre YouTube en tu TV y busca el video, o usa Cast desde Chrome."
          : "Usa AirPlay (iPhone) o Chromecast desde el navegador en tu TV.",
      );
    } finally {
      setBusy(false);
    }
  }, [titulo, streamUrl, youtubeId]);

  if (!streamUrl && !youtubeId) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={() => void handlePress()}
        disabled={busy}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ver en TV"
      >
        <Text style={styles.icon}>📺</Text>
        <Text style={styles.label}>{busy ? "…" : "Ver en TV"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnPressed: { opacity: 0.85 },
  icon: { fontSize: 16 },
  label: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
