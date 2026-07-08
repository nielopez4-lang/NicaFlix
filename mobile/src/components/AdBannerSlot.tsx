"use client";

import { MONETAG_ZONES, type MonetagZoneKey } from "@/lib/monetag-zones";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

import { WEB_URL } from "@/lib/monetag";

type Props = {
  height?: number;
  style?: ViewStyle;
  /** Clave del slot (HOME_TOP, DEPORTES_MID, etc.) */
  slot?: MonetagZoneKey;
  zoneId?: string;
};

/** Cuadro de anuncio Monetag — mismo AdContainer que la web vía /api/ad-embed */
export function AdBannerSlot({
  height = 250,
  style,
  slot = "HOME_TOP",
  zoneId,
}: Props) {
  const zone = zoneId ?? MONETAG_ZONES[slot] ?? "";
  const uri = zone
    ? `${WEB_URL}/api/ad-embed?zone=${encodeURIComponent(zone)}&h=${height}`
    : `${WEB_URL}/api/ad-embed?h=${height}`;

  return (
    <View style={[styles.wrap, { height }, style]}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#0f0f14",
  },
  webview: { flex: 1, backgroundColor: "#0f0f14" },
});
