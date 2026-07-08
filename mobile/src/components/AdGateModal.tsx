import { verificarAcceso } from "@/lib/verificarAcceso";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adUrl?: string;
};

const DEFAULT_AD = "https://example.com/ad-placeholder";

export function AdGateModal({
  visible,
  onClose,
  onSuccess,
  adUrl = DEFAULT_AD,
}: Props) {
  const [checking, setChecking] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!visible) return;
    verificarAcceso().then((acceso) => {
      if (acceso.puedeSaltarAds) {
        onSuccess();
        return;
      }
      setChecking(false);
    });
  }, [visible, onSuccess]);

  useEffect(() => {
    if (checking || !visible) return;
    if (countdown <= 0) {
      onSuccess();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, checking, visible, onSuccess]);

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {!checking && (
          <>
            <Text style={styles.title}>Anuncio — {countdown}s</Text>
            <WebView source={{ uri: adUrl }} style={styles.webview} />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F", paddingTop: 48 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },
  sub: { color: "#8B8B9A", textAlign: "center", marginTop: 8, marginBottom: 12 },
  webview: { flex: 1 },
  countdown: { color: "#E50914", fontSize: 24, fontWeight: "700", textAlign: "center", padding: 16 },
  proBtn: { backgroundColor: "#E50914", margin: 16, padding: 16, borderRadius: 12 },
  proText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
