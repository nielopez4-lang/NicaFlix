import { getExpoEnv } from "@/lib/env";

const DEFAULT_ZONE_ID = "258015";
const DEFAULT_DIRECT_LINK = "https://quge5.com/4/258015";

const WEB_URL =
  getExpoEnv("EXPO_PUBLIC_WEB_URL") ||
  getExpoEnv("EXPO_PUBLIC_API_URL") ||
  "https://web-five-plum-og6kinpc9v.vercel.app";

export const DIRECT_LINK_ZONE_ID =
  getExpoEnv("EXPO_PUBLIC_MONETAG_DIRECT_LINK_ZONE") || DEFAULT_ZONE_ID;

export const DIRECT_LINK_URL =
  getExpoEnv("EXPO_PUBLIC_MONETAG_DIRECT_LINK") || DEFAULT_DIRECT_LINK;

export const VIDEO_AD = {
  prerollSeconds: 10,
  midrollDisplaySec: 15,
  midrollIntervalMs: 15 * 60 * 1000,
} as const;

export const MONETAG_ZONE_ID =
  getExpoEnv("EXPO_PUBLIC_MONETAG_ZONE_ID") || DEFAULT_ZONE_ID;

export function getAdEmbedUrl(zoneId?: string, height = 250): string {
  const zone = zoneId || MONETAG_ZONE_ID || DIRECT_LINK_ZONE_ID;
  return `${WEB_URL}/api/ad-embed?zone=${encodeURIComponent(zone)}&h=${height}`;
}

export function getAdGateUrl(): string {
  return `${WEB_URL}/adgate`;
}

export const MONETAG_ENABLED = Boolean(DIRECT_LINK_URL || MONETAG_ZONE_ID);

export function openDirectLink(): void {
  const { Linking } = require("react-native");
  if (DIRECT_LINK_URL) void Linking.openURL(DIRECT_LINK_URL);
}

export { WEB_URL };
