/** Zone IDs para banners móviles (mismas env que web en eas.json) */
function zone(...keys: (string | undefined)[]): string {
  for (const k of keys) {
    const v = k?.trim();
    if (v) return v;
  }
  return (
    process.env.EXPO_PUBLIC_MONETAG_ZONE_BANNER?.trim() ||
    process.env.EXPO_PUBLIC_MONETAG_ZONE_ID?.trim() ||
    ""
  );
}

export const MONETAG_ZONES = {
  HOME_TOP: zone(process.env.EXPO_PUBLIC_MONETAG_ZONE_HOME_TOP),
  HOME_MID: zone(process.env.EXPO_PUBLIC_MONETAG_ZONE_HOME_MID),
  DEPORTES_MID: zone(
    process.env.EXPO_PUBLIC_MONETAG_ZONE_DEPORTES,
    process.env.EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_MID,
  ),
  DEPORTES_TOP: zone(
    process.env.EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_TOP,
    process.env.EXPO_PUBLIC_MONETAG_ZONE_DEPORTES,
  ),
  CATALOG_TOP: zone(process.env.EXPO_PUBLIC_MONETAG_ZONE_CATALOG),
} as const;

export type MonetagZoneKey = keyof typeof MONETAG_ZONES;
