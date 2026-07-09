import { AdGateModal } from "@/components/AdGateModal";
import { CastToTvButton } from "@/components/CastToTvButton";
import { LicensedStreamPlayer } from "@/components/LicensedStreamPlayer";
import { SplitScreenAdGate } from "@/components/SplitScreenAdGate";
import { findChannel } from "@/lib/content";
import { useMobilePlaybackAds } from "@/hooks/useMobilePlaybackAds";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { LiveChannel } from "@/lib/content";

export default function LivePlayerScreen() {
  const { id, ads } = useLocalSearchParams<{ id: string; ads?: string }>();
  const [canal, setCanal] = useState<LiveChannel | null>(null);
  const [adDone, setAdDone] = useState(ads !== "1");
  const [loading, setLoading] = useState(true);
  const { started, gateOpen, gateKind, requestPreroll, completeGate } =
    useMobilePlaybackAds();

  useEffect(() => {
    if (id) findChannel(id).then((c) => { setCanal(c ?? null); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (adDone && canal) requestPreroll();
  }, [adDone, canal, requestPreroll]);

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
          <SplitScreenAdGate
            visible={gateOpen}
            kind={gateKind}
            onComplete={completeGate}
            style={styles.flex}
          >
            {started ? (
              <LicensedStreamPlayer streamUrl={canal.streamUrl} titulo={canal.nombre} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{canal.nombre}</Text>
              </View>
            )}
          </SplitScreenAdGate>
          {started ? (
            <CastToTvButton titulo={canal.nombre} streamUrl={canal.streamUrl} />
          ) : null}
        </View>
      )}
    </>
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
  placeholderText: { color: "#8B8B9A" },
  error: { color: "#fff" },
});
