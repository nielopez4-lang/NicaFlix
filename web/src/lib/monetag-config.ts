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

export function openDirectLink(): void {
  if (typeof window === "undefined" || !DIRECT_LINK_URL) return;
  window.open(DIRECT_LINK_URL, "_blank", "noopener,noreferrer");
}

export function buildBannerAdHtml(
  zone: string,
  invokeUrl: string,
  minHeight = 250,
): string {
  return buildSlotAdHtml(zone, invokeUrl, DIRECT_LINK_URL, minHeight);
}

/** HTML para cuadros de anuncio: solo banner nativo Monetag (sin iframe Direct Link). */
export function buildSlotAdHtml(
  zone: string,
  invokeUrl: string,
  directLinkUrl: string,
  minHeight = 250,
): string {
  const invokeTag = invokeUrl
    ? `<script async="async" data-cfasync="false" src="${invokeUrl}"><\/script>`
    : "";

  const fallbackLink = directLinkUrl
    ? `<a id="ad-fallback" class="ad-fallback" href="${directLinkUrl}" target="_blank" rel="noopener noreferrer sponsored">
  <span class="ad-fallback-label">Publicidad</span>
  <span class="ad-fallback-cta">Ver oferta patrocinada →</span>
</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
${invokeTag}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{min-height:100%;background:#0f0f14}
  #container-${zone}{
    min-height:${minHeight}px;
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .ad-fallback{
    display:none;
    min-height:${minHeight}px;
    width:100%;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:10px;
    text-decoration:none;
    background:linear-gradient(135deg,#1a1a24 0%,#0f0f14 100%);
    border:1px dashed rgba(255,255,255,0.12);
    color:#fff;
    padding:16px;
  }
  .ad-fallback-label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#8b8b9a}
  .ad-fallback-cta{font-size:15px;font-weight:600;color:#e50914}
  .ad-fallback.visible{display:flex}
</style>
</head>
<body>
  <div id="container-${zone}"></div>
  ${fallbackLink}
  <script>
    (function(){
      var zone="${zone}";
      var fb=document.getElementById("ad-fallback");
      function showFallback(){
        if(!fb) return;
        var c=document.getElementById("container-"+zone);
        if(c && c.children.length > 0) return;
        fb.className="ad-fallback visible";
      }
      setTimeout(showFallback, 4000);
    })();
  <\/script>
</body>
</html>`;
}

export const SITE_URL =
  getPublicEnv("NEXT_PUBLIC_SITE_URL") || MONETAG_DEFAULTS.siteUrl;

export const ANDROID_APK_URL =
  getPublicEnv("NEXT_PUBLIC_ANDROID_APK_URL") || MONETAG_DEFAULTS.androidApkUrl;
export const IOS_APP_URL = getPublicEnv("NEXT_PUBLIC_IOS_APP_URL");

/** true cuando hay zone + direct link configurados (env o defaults) */
export const MONETAG_READY = Boolean(zoneId && DIRECT_LINK_URL);
