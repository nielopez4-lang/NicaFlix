/**
 * Variables de entorno — app móvil (Expo).
 * Prefijo estándar: EXPO_PUBLIC_
 * Fallback: NEXT_PUBLIC_ y SIGUIENTE_* (compatibilidad con Vercel)
 */

const LEGACY_ALIASES: Record<string, string[]> = {
  EXPO_PUBLIC_API_URL: [
    "NEXT_PUBLIC_API_URL",
    "SIGUIENTE_URL_API",
    "SIGUIENTE_API_URL",
  ],
  EXPO_PUBLIC_WEB_URL: [
    "NEXT_PUBLIC_SITE_URL",
    "SIGUIENTE_URL_SITIO",
    "SIGUIENTE_SITE_URL",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_ID: [
    "NEXT_PUBLIC_MONETAG_ZONE_ID",
    "SIGUIENTE_ID_ZONA_MONETAG",
    "SIGUIENTE_MONETAG_ZONE_ID",
  ],
  EXPO_PUBLIC_MONETAG_DIRECT_LINK: [
    "NEXT_PUBLIC_MONETAG_DIRECT_LINK",
    "SIGUIENTE_ENLACE_DIRECTO_DE_MONETAG",
    "SIGUIENTE_ENLACE_DIRECTO_DE_MONETAG_I",
    "SIGUIENTE_ENLACE_DIRECTO_MONETAG",
  ],
  EXPO_PUBLIC_MONETAG_DIRECT_LINK_ZONE: [
    "NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE",
    "SIGUIENTE_ID_ENLACE_DIRECTO_MONETAG",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_BANNER: [
    "NEXT_PUBLIC_MONETAG_ZONE_BANNER",
    "SIGUIENTE_MONETAG_ZONE_BANNER",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_HOME_TOP: [
    "NEXT_PUBLIC_MONETAG_ZONE_HOME_TOP",
    "SIGUIENTE_ZONA_HOME_TOP",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_HOME_MID: [
    "NEXT_PUBLIC_MONETAG_ZONE_HOME_MID",
    "SIGUIENTE_ZONA_HOME_MID",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_DEPORTES: [
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES",
    "SIGUIENTE_ZONA_DEPORTES",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_TOP: [
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_TOP",
    "SIGUIENTE_ZONA_DEPORTES_TOP",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_DEPORTES_MID: [
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_MID",
    "SIGUIENTE_ZONA_DEPORTES_MID",
  ],
  EXPO_PUBLIC_MONETAG_ZONE_CATALOG: [
    "NEXT_PUBLIC_MONETAG_ZONE_CATALOG",
    "SIGUIENTE_ZONA_CATALOG",
  ],
};

export function getExpoEnv(key: string): string {
  const primary = process.env[key]?.trim();
  if (primary) return primary;

  for (const legacy of LEGACY_ALIASES[key] ?? []) {
    const value = process.env[legacy]?.trim();
    if (value) return value;
  }

  return "";
}

export function getExpoEnvFirst(...keys: string[]): string {
  for (const key of keys) {
    const value = getExpoEnv(key);
    if (value) return value;
  }
  return "";
}
