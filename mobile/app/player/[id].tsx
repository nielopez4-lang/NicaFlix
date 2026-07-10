import { findContent } from "@/lib/content";
import { CastToTvButton } from "@/components/CastToTvButton";
import { SplitScreenAdGate } from "@/components/SplitScreenAdGate";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { LicensedStreamPlayer } from "@/components/LicensedStreamPlayer";
import { useMobilePlaybackAds } from "@/hooks/useMobilePlaybackAds";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ContentItem } from "@/lib/content";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { started, gateOpen, gateKind, requestPreroll, completeGate } =
    useMobilePlaybackAds();

  useEffect(() => {
    if (id) findContent(id).then((c) => { setItem(c ?? null); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Contenido no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SplitScreenAdGate
        visible={gateOpen}
        kind={gateKind}
        onComplete={completeGate}
        style={styles.playerWrap}
      >
        {!started ? (
          <Pressable style={styles.playGate} onPress={requestPreroll}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playText}>Reproducir</Text>
          </Pressable>
        ) : item.youtubeId ? (
          <YouTubePlayer youtubeId={item.youtubeId} />
        ) : item.streamUrl ? (
          <LicensedStreamPlayer streamUrl={item.streamUrl} titulo={item.titulo} />
        ) : (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableText}>
              Reproductor no disponible para este título.
            </Text>
          </View>
        )}
        {started ? (
          <CastToTvButton
            titulo={item.titulo}
            youtubeId={item.youtubeId}
            streamUrl={item.streamUrl}
          />
        ) : null}
      </SplitScreenAdGate>
      <View style={styles.info}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.sinopsis}>{item.sinopsis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  playerWrap: { position: "relative", minHeight: 220 },
  playGate: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { color: "#fff", fontSize: 48 },
  playText: { color: "#8B8B9A", marginTop: 8 },
  unavailable: {
    aspectRatio: 16 / 9,
    backgroundColor: "#12121a",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  unavailableText: { color: "#8B8B9A", textAlign: "center" },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  error: { color: "#fff" },
  info: { padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sinopsis: { color: "#8B8B9A", marginTop: 8, lineHeight: 22 },
});
