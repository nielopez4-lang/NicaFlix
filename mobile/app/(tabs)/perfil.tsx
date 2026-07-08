import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "react-native";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3000";

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>NicaFlix</Text>
      <Text style={styles.sub}>100% gratis — sin suscripción</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Monetización solo con anuncios (Monetag). Películas de Internet Archive,
          anime popular y TV en vivo de fuentes abiertas.
        </Text>
      </View>

      <Pressable style={styles.btn} onPress={() => Linking.openURL(WEB_URL)}>
        <Text style={styles.btnText}>Abrir web NicaFlix</Text>
      </Pressable>

      <Pressable
        style={styles.btnSecondary}
        onPress={() => Linking.openURL(`${WEB_URL}/#descargar`)}
      >
        <Text style={styles.btnSecondaryText}>Compartir / descargar app</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F", padding: 24, alignItems: "center" },
  logo: { width: 100, height: 100, borderRadius: 24, marginTop: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 16 },
  sub: { color: "#E50914", marginTop: 8, fontWeight: "600" },
  card: { backgroundColor: "#14141A", borderRadius: 16, padding: 20, marginTop: 32, width: "100%" },
  cardText: { color: "#8B8B9A", lineHeight: 22, textAlign: "center" },
  btn: { backgroundColor: "#E50914", padding: 16, borderRadius: 12, marginTop: 24, width: "100%" },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  btnSecondary: { borderWidth: 1, borderColor: "#444", padding: 16, borderRadius: 12, marginTop: 12, width: "100%" },
  btnSecondaryText: { color: "#fff", textAlign: "center" },
});
