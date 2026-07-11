import { CastToTvButton } from "@/components/CastToTvButton";
import { LicensedStreamPlayer } from "@/components/LicensedStreamPlayer";
import { SplitScreenAdGate } from "@/components/SplitScreenAdGate";
import { findChannel } from "@/lib/content";
import { useMobilePlaybackAds } from "@/hooks/useMobilePlaybackAds";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { LiveChannel } from "@/lib/content";

export default function LivePlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [canal, setCanal] = useState<LiveChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const { started, gateOpen, gateKind, requestPreroll, completeGate } =
    useMobilePlaybackAds();

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
    <View style={styles.playerWrap}>
      <SplitScreenAdGate
        visible={gateOpen}
        kind={gateKind}
        onComplete={completeGate}
        style={styles.flex}
      >
        {started ? (
          <LicensedStreamPlayer streamUrl={canal.streamUrl} titulo={canal.nombre} />
        ) : (
          <Pressable style={styles.placeholder} onPress={requestPreroll}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.placeholderText}>Ver en vivo</Text>
          </Pressable>
        )}
      </SplitScreenAdGate>
      {started ? (
        <CastToTvButton titulo={canal.nombre} streamUrl={canal.streamUrl} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  playerWrap: { flex: 1, position: "relative" },
  flex: { flex: 1 },
  placeholder: {
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { color: "#E50914", fontSize: 48 },
  placeholderText: { color: "#8B8B9A", marginTop: 8 },
  error: { color: "#fff" },
});
