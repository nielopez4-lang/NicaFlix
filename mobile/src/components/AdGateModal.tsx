import { Linking } from "react-native";
import {
  DIRECT_LINK_URL,
  VIDEO_AD,
} from "@/lib/monetag";
import { verificarAcceso } from "@/lib/verificarAcceso";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AdGateModal({ visible, onClose, onSuccess }: Props) {
  const [checking, setChecking] = useState(true);
  const [countdown, setCountdown] = useState(VIDEO_AD.prerollSeconds);
  const linkOpened = useRef(false);

  useEffect(() => {
    if (!visible) {
      linkOpened.current = false;
      return;
    }
    setCountdown(VIDEO_AD.prerollSeconds);
    verificarAcceso().then((acceso) => {
      if (acceso.puedeSaltarAds) {
        onSuccess();
        return;
      }
      setChecking(false);
    });
  }, [visible, onSuccess]);

  useEffect(() => {
    if (!visible || checking || linkOpened.current) return;
    linkOpened.current = true;
    if (DIRECT_LINK_URL) void Linking.openURL(DIRECT_LINK_URL);
  }, [visible, checking]);

  useEffect(() => {
    if (checking || !visible) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, checking, visible]);

  if (!visible) return null;

  const ready = countdown <= 0;

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {!checking && (
          <>
            <Text style={styles.counter}>{ready ? "✓" : countdown}</Text>
            <Pressable
              style={[styles.continueBtn, !ready && styles.continueDisabled]}
              disabled={!ready}
              onPress={onSuccess}
            >
              <Text style={styles.continueText}>
                {ready ? "Continuar" : `${countdown}s`}
              </Text>
            </Pressable>
            <Pressable style={styles.skipHint} onPress={onClose}>
              <Text style={styles.skipText}>Cerrar</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  counter: {
    color: "#E50914",
    fontSize: 64,
    fontWeight: "800",
    marginBottom: 32,
  },
  continueBtn: {
    backgroundColor: "#E50914",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    maxWidth: 280,
  },
  continueDisabled: { opacity: 0.4 },
  continueText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 16 },
  skipHint: { padding: 24 },
  skipText: { color: "#8B8B9A", textAlign: "center" },
});
