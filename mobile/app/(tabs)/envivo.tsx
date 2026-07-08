import { loadLiveData } from "@/lib/content";
import type { LiveChannel } from "@/lib/content";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        {lives.length} canales — Nicaragua, LATAM y EE.UU. (iptv-org)
      </Text>
      <FlatList
        data={lives}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable style={styles.channel} onPress={() => router.push(`/live/${item.id}`)}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.cat}>{item.pais}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  hint: { color: "#8B8B9A", padding: 16, fontSize: 13 },
  grid: { padding: 12 },
  channel: {
    flex: 1,
    margin: 8,
    backgroundColor: "#14141A",
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
  },
  name: { color: "#fff", fontWeight: "600" },
  cat: { color: "#8B8B9A", fontSize: 12, marginTop: 4 },
});
