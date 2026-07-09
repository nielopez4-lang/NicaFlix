import { getExpoEnv, getExpoEnvFirst } from "@/lib/env";

const DEFAULT_ZONE_ID = "258015";

/** Zone IDs para banners móviles */
function zone(...keys: string[]): string {
  for (const key of keys) {
    const value = getExpoEnv(key);
    if (value) return value;
  }
  return (
    getExpoEnvFirst(
      "EXPO_PUBLIC_MONETAG_ZONE_BANNER",
      "EXPO_PUBLIC_MONETAG_ZONE_ID",
    ) || DEFAULT_ZONE_ID
  );
}

export const MONETAG_ZONES = {
  HOME_TOP: zone("EXPO_PUBLIC_MONETAG_ZONE_HOME_TOP"),
  HOME_MID: zone("EXPO_PUBLIC_MONETAG_ZONE_HOME_MID"),
  DEPORTES_MID: zone(
    "EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_MID",
    "EXPO_PUBLIC_MONETAG_ZONE_DEPORTES",
  ),
  DEPORTES_TOP: zone(
    "EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_TOP",
    "EXPO_PUBLIC_MONETAG_ZONE_DEPORTES",
  ),
  CATALOG_TOP: zone("EXPO_PUBLIC_MONETAG_ZONE_CATALOG"),
  PREROLL: zone("EXPO_PUBLIC_MONETAG_ZONE_PREROLL"),
} as const;

export type MonetagZoneKey = keyof typeof MONETAG_ZONES;
