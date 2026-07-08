import { findContent } from "@/lib/content";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { LicensedStreamPlayer } from "@/components/LicensedStreamPlayer";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ContentItem } from "@/lib/content";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

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
      {item.youtubeId ? (
        <YouTubePlayer youtubeId={item.youtubeId} />
      ) : item.streamUrl ? (
        <LicensedStreamPlayer streamUrl={item.streamUrl} titulo={item.titulo} />
      ) : null}
      <View style={styles.info}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.sinopsis}>{item.sinopsis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  error: { color: "#fff" },
  info: { padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sinopsis: { color: "#8B8B9A", marginTop: 8, lineHeight: 22 },
});
