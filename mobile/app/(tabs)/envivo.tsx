import { loadLiveData } from "@/lib/content";
import type { LiveChannel } from "@/lib/content";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function channelLine(item: LiveChannel): string {
  const parts = [
    item.red,
    item.pais,
    item.categoria !== item.pais ? item.categoria : "",
  ].filter(Boolean);
  return [...new Set(parts)].join(" · ");
}

function ChannelGrid({
  items,
  onPress,
}: {
  items: LiveChannel[];
  onPress: (id: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.channel}
          onPress={() => onPress(item.id)}
        >
          <Text style={styles.name}>{item.nombre}</Text>
          <Text style={styles.cat}>{channelLine(item)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function EnVivoScreen() {
  const router = useRouter();
  const [lives, setLives] = useState<LiveChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveData().then((d) => {
      setLives(d.lives);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  const clasicos = lives.filter((ch) => ch.categoria === "Clásicos");
  const otros = lives.filter((ch) => ch.categoria !== "Clásicos");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.hint}>
        {lives.length} canales — El Chavo, Televisa, MLB, LATAM y EE.UU.
      </Text>
      {clasicos.length > 0 && (
        <>
          <Text style={styles.section}>Chespirito & clásicos</Text>
          <ChannelGrid items={clasicos} onPress={(id) => router.push(`/live/${id}`)} />
        </>
      )}
      <Text style={styles.section}>Más canales</Text>
      <ChannelGrid items={otros} onPress={(id) => router.push(`/live/${id}`)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  scroll: { paddingBottom: 24 },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  hint: { color: "#8B8B9A", padding: 16, fontSize: 13 },
  section: { color: "#E50914", fontWeight: "700", fontSize: 16, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 8 },
  channel: {
    width: "46%",
    margin: "2%",
    backgroundColor: "#14141A",
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
  },
  name: { color: "#fff", fontWeight: "600" },
  cat: { color: "#8B8B9A", fontSize: 12, marginTop: 4 },
});
