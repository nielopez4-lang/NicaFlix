/**
 * Configuración centralizada Monetag — NicaFlix
 * Variables: NEXT_PUBLIC_* (Vercel) con fallback a MONETAG_DEFAULTS
 */
import { getPublicEnv, getPublicEnvFirst } from "@/lib/env";
import { MONETAG_DEFAULTS } from "@/lib/monetag-defaults";

export function primaryZoneId(): string {
  return getPublicEnv("NEXT_PUBLIC_MONETAG_ZONE_ID") || MONETAG_DEFAULTS.zoneId;
}

function fallbackZone(...keys: string[]): string {
  for (const key of keys) {
    const value = getPublicEnv(key);
    if (value) return value;
  }
  return (
    getPublicEnvFirst(
      "NEXT_PUBLIC_MONETAG_ZONE_BANNER",
      "NEXT_PUBLIC_MONETAG_ZONE_ID",
    ) || MONETAG_DEFAULTS.zoneId
  );
}

/** Zone ID Direct Link para triggers de video (pre-roll / mid-roll) */
export const DIRECT_LINK_ZONE_ID =
  getPublicEnv("NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE") ||
  MONETAG_DEFAULTS.directLinkZone;

/** URL Direct Link Monetag */
export const DIRECT_LINK_URL =
  getPublicEnv("NEXT_PUBLIC_MONETAG_DIRECT_LINK") ||
  MONETAG_DEFAULTS.directLink;

/** Triggers automáticos en reproductor */
export const VIDEO_AD = {
  prerollSeconds: 10,
  /** Segundos que permanece visible el panel de anuncio en mid-roll (video sigue) */
  midrollDisplaySec: 15,
  midrollIntervalMs: 15 * 60 * 1000,
  midrollIntervalSec: 15 * 60,
  midrollCheckMs: 20_000,
} as const;

const zoneId = primaryZoneId();

/** MultiTag global (head) — carga async, no bloquea */
export const MONETAG_GLOBAL = {
  zoneId,
  scriptSrc:
    getPublicEnv("NEXT_PUBLIC_MONETAG_SCRIPT_SRC") ||
    MONETAG_DEFAULTS.multitagScript,
  scriptIpp: getPublicEnv("NEXT_PUBLIC_MONETAG_SCRIPT_IPP"),
  verify: MONETAG_DEFAULTS.verify,
} as const;

/** 12 Banner Containers — un zoneId por slot (mismo ID si no hay zonas extra) */
export const MONETAG_ZONES = {
  HOME_TOP: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_HOME_TOP"),
  HOME_MID: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_HOME_MID"),
  HOME_FEATURE: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_HOME_FEATURE"),
  HOME_BOTTOM: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_HOME_BOTTOM"),
  DEPORTES_TOP: fallbackZone(
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_TOP",
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES",
  ),
  DEPORTES_MID: fallbackZone(
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_MID",
    "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES",
  ),
  CATALOG_TOP: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_CATALOG"),
  ENVIVO_TOP: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_ENVIVO"),
  PLAYER_BOTTOM: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_PLAYER"),
  ADGATE_TOP: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_ADGATE_TOP"),
  ADGATE_MID: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_ADGATE_MID"),
  ADGATE_BOTTOM: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_ADGATE_BOTTOM"),
  PREROLL: fallbackZone("NEXT_PUBLIC_MONETAG_ZONE_PREROLL"),
} as const;

export type MonetagZoneKey = keyof typeof MONETAG_ZONES;

export function resolveZoneId(
  zoneIdParam?: string | null,
  fallbackKey?: MonetagZoneKey,
): string {
  if (zoneIdParam) return zoneIdParam;
  if (fallbackKey && MONETAG_ZONES[fallbackKey]) {
    return MONETAG_ZONES[fallbackKey];
  }
  return fallbackZone();
}

export function getInvokeScriptUrl(zone: string): string {
  const custom = getPublicEnv("NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT");
  if (custom) return custom;
  return `https://www.highperformanceformat.com/${zone}/invoke.js`;
}

/** Desactivado: Direct Link abría popups invasivos (juegos) y bloqueaba móvil. */
export function openDirectLink(): void {
  /* Sin pop-under / pestañas externas — anuncios solo en slots controlados. */
}

export function buildBannerAdHtml(
  zone: string,
  invokeUrl: string,
  minHeight = 250,
): string {
  return buildNativeAdSlotHtml(zone, minHeight, invokeUrl);
}

/** HTML aislado por iframe: invoke.js → banner nativo Monetag (sin MultiTag global). */
export function buildNativeAdSlotHtml(
  zone: string,
  minHeight = 250,
  invokeUrl?: string,
): string {
  const invoke =
    invokeUrl || getInvokeScriptUrl(zone);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://www.highperformanceformat.com"/>
<script async data-cfasync="false" src="${invoke}"><\/script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{background:#0f0f14;overflow:hidden}
  #container-${zone}{
    min-height:${minHeight}px;
    width:100%;
    display:flex;
    align-items:stretch;
    justify-content:center;
  }
</style>
</head>
<body><div id="container-${zone}"></div></body>
</html>`;
}

/** @deprecated Usar buildNativeAdSlotHtml */
export function buildSlotAdHtml(
  zone: string,
  invokeUrl: string,
  _directLinkUrl: string,
  minHeight = 250,
): string {
  return buildNativeAdSlotHtml(zone, minHeight, invokeUrl);
}

export const SITE_URL =
  getPublicEnv("NEXT_PUBLIC_SITE_URL") || MONETAG_DEFAULTS.siteUrl;

export const ANDROID_APK_URL =
  getPublicEnv("NEXT_PUBLIC_ANDROID_APK_URL") || MONETAG_DEFAULTS.androidApkUrl;
export const IOS_APP_URL = getPublicEnv("NEXT_PUBLIC_IOS_APP_URL");

/** true cuando hay zone + direct link configurados (env o defaults) */
export const MONETAG_READY = Boolean(zoneId && DIRECT_LINK_URL);
