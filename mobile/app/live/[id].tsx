import { AdGateModal } from "@/components/AdGateModal";
import { CastToTvButton } from "@/components/CastToTvButton";
import { LicensedStreamPlayer } from "@/components/LicensedStreamPlayer";
import { findChannel } from "@/lib/content";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { LiveChannel } from "@/lib/content";

export default function LivePlayerScreen() {
  const { id, ads } = useLocalSearchParams<{ id: string; ads?: string }>();
  const [canal, setCanal] = useState<LiveChannel | null>(null);
  const [adDone, setAdDone] = useState(ads !== "1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) findChannel(id).then((c) => { setCanal(c ?? null); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  if (!canal) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Canal no encontrado</Text>
      </View>
    );
  }

  return (
    <>
      {!adDone && (
        <AdGateModal visible onClose={() => setAdDone(true)} onSuccess={() => setAdDone(true)} />
      )}
      {adDone && (
        <View style={styles.playerWrap}>
          <LicensedStreamPlayer streamUrl={canal.streamUrl} titulo={canal.nombre} />
          <CastToTvButton titulo={canal.nombre} streamUrl={canal.streamUrl} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  playerWrap: { flex: 1, position: "relative" },
  error: { color: "#fff" },
});
