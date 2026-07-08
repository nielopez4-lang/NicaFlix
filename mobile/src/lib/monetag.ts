/**
 * Configuración Monetag — app móvil (sincronizada con web)
 */
const WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL ??
  "https://web-five-plum-og6kinpc9v.vercel.app";

export const DIRECT_LINK_ZONE_ID =
  process.env.EXPO_PUBLIC_MONETAG_DIRECT_LINK_ZONE?.trim() || "11257226";

export const DIRECT_LINK_URL =
  process.env.EXPO_PUBLIC_MONETAG_DIRECT_LINK?.trim() ||
  `https://omg10.com/4/${DIRECT_LINK_ZONE_ID}`;

export const VIDEO_AD = {
  prerollSeconds: 10,
  midrollIntervalMs: 15 * 60 * 1000,
} as const;

export const MONETAG_ZONE_ID =
  process.env.EXPO_PUBLIC_MONETAG_ZONE_ID?.trim() ?? "";

export function getAdEmbedUrl(): string {
  return `${WEB_URL}/api/ad-embed`;
}

export function getAdGateUrl(): string {
  return `${WEB_URL}/adgate`;
}

export const MONETAG_ENABLED = Boolean(DIRECT_LINK_URL || MONETAG_ZONE_ID);

export function openDirectLink(): void {
  const { Linking } = require("react-native");
  if (DIRECT_LINK_URL) void Linking.openURL(DIRECT_LINK_URL);
}
