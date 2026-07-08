import { AdGateModal } from "@/components/AdGateModal";
import { loadCatalog } from "@/lib/content";
import { activarPase24h } from "@/lib/verificarAcceso";
import type { ContentItem } from "@/lib/content";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const categorias = [
  { key: "peliculas", label: "Películas" },
  { key: "series", label: "Series" },
  { key: "anime", label: "Anime" },
  { key: "kids", label: "Zona Infantil" },
] as const;

export default function InicioScreen() {
  const router = useRouter();
  const [catalogo, setCatalogo] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adVisible, setAdVisible] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog().then((c) => {
      setCatalogo(c);
      setLoading(false);
    });
  }, []);

  const abrirItem = (id: string, esKids = false) => {
    if (esKids) {
      router.push(`/player/${id}`);
      return;
    }
    setPendingId(id);
    setAdVisible(true);
  };

  const onAdSuccess = useCallback(async () => {
    setAdVisible(false);
    if (pendingId) {
      await activarPase24h();
      router.push(`/player/${pendingId}`);
      setPendingId(null);
    }
  }, [pendingId, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        {categorias.map(({ key, label }) => {
          const items = catalogo.filter((i) => i.categoria === key);
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.rowTitle}>{label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.length === 0 ? (
                  <Text style={styles.empty}>Conecta la web API para cargar {label.toLowerCase()}</Text>
                ) : (
                  items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => abrirItem(item.id, key === "kids")}
                      style={styles.card}
                    >
                      <Image source={{ uri: item.portada }} style={styles.cover} />
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.titulo}
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
      <AdGateModal visible={adVisible} onClose={() => setAdVisible(false)} onSuccess={onAdSuccess} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, backgroundColor: "#0B0B0F", alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#8B8B9A", marginTop: 12 },
  logo: { width: 72, height: 72, borderRadius: 16, marginBottom: 16, alignSelf: "center" },
  row: { marginBottom: 24 },
  rowTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  card: { width: 140, marginRight: 12 },
  cover: { width: 140, height: 200, borderRadius: 12, backgroundColor: "#222" },
  cardTitle: { color: "#ccc", fontSize: 12, marginTop: 8 },
  empty: { color: "#8B8B9A", padding: 16 },
});
