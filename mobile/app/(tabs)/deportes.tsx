import { loadLiveData } from "@/lib/content";
import type { LiveChannel, SportEvent } from "@/lib/content";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function DeportesScreen() {
  const router = useRouter();
  const [deportes, setDeportes] = useState<LiveChannel[]>([]);
  const [eventos, setEventos] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveData().then((d) => {
      setDeportes(d.deportesCanales);
      setEventos(d.eventosDeportes);
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
    <ScrollView style={styles.container}>
      <View style={styles.adSlot}>
        <Text style={styles.adLabel}>Monetag — Resultados</Text>
      </View>

      {eventos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No hay eventos en vivo ahora</Text>
          <Text style={styles.emptySub}>Consulta el calendario o canales abajo</Text>
        </View>
      ) : (
        eventos.map((item) => (
          <Pressable
            key={item.id}
            style={styles.event}
            onPress={() => item.canalId && router.push(`/live/${item.canalId}`)}
          >
            <View>
              <Text style={styles.eventTitle}>{item.titulo}</Text>
              <Text style={styles.eventTime}>{item.hora}</Text>
            </View>
            <Text style={styles.liveBtn}>Ver en Vivo</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.sectionTitle}>Canales deportivos ({deportes.length})</Text>
      <FlatList
        data={deportes}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.channelRow} onPress={() => router.push(`/live/${item.id}`)}>
            <Text style={styles.channelName}>{item.nombre}</Text>
            <Text style={styles.channelPais}>{item.pais}</Text>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  adSlot: {
    margin: 16,
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  adLabel: { color: "#8B8B9A", fontSize: 12 },
  empty: { padding: 32, alignItems: "center" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySub: { color: "#8B8B9A", marginTop: 8 },
  event: {
    backgroundColor: "#14141A",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: { color: "#fff", fontWeight: "600", flex: 1 },
  eventTime: { color: "#8B8B9A", marginTop: 4, fontSize: 12 },
  liveBtn: { color: "#E50914", fontWeight: "700" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", margin: 16 },
  channelRow: {
    backgroundColor: "#14141A",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
  },
  channelName: { color: "#fff", fontWeight: "600" },
  channelPais: { color: "#8B8B9A", fontSize: 12, marginTop: 4 },
});
