/**
 * Configuración centralizada Monetag — NicaFlix
 * Banner containers + triggers de video (pre-roll / mid-roll)
 */

function env(id: string | undefined): string {
  return id?.trim() ?? "";
}

function fallbackZone(...candidates: (string | undefined)[]): string {
  for (const id of candidates) {
    if (id && id.trim()) return id.trim();
  }
  return (
    env(process.env.NEXT_PUBLIC_MONETAG_ZONE_BANNER) ||
    env(process.env.NEXT_PUBLIC_MONETAG_ZONE_ID)
  );
}

/** Zone ID Direct Link para triggers de video (pre-roll / mid-roll) */
export const DIRECT_LINK_ZONE_ID =
  env(process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE) || "11257226";

/** URL Direct Link Monetag */
export const DIRECT_LINK_URL =
  env(process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK) ||
  `https://omg10.com/4/${DIRECT_LINK_ZONE_ID}`;

/** Triggers automáticos en reproductor */
export const VIDEO_AD = {
  prerollSeconds: 10,
  midrollIntervalMs: 15 * 60 * 1000,
  midrollIntervalSec: 15 * 60,
  /** Intervalo de comprobación mid-roll (no bloquea render) */
  midrollCheckMs: 20_000,
} as const;

/** MultiTag global (head) — carga async, no bloquea */
export const MONETAG_GLOBAL = {
  zoneId: env(process.env.NEXT_PUBLIC_MONETAG_ZONE_ID),
  scriptSrc:
    env(process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC) ||
    (env(process.env.NEXT_PUBLIC_MONETAG_ZONE_ID)
      ? `https://s.monetag.com/tag/${process.env.NEXT_PUBLIC_MONETAG_ZONE_ID}.js`
      : ""),
  scriptIpp: env(process.env.NEXT_PUBLIC_MONETAG_SCRIPT_IPP),
  verify: "6c34729c43bee7297fd3f09cf22ea9ab",
} as const;

/** 12 Banner Containers — un zoneId por slot */
export const MONETAG_ZONES = {
  HOME_TOP: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_HOME_TOP),
  HOME_MID: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_HOME_MID),
  HOME_FEATURE: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_HOME_FEATURE),
  HOME_BOTTOM: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_HOME_BOTTOM),
  DEPORTES_TOP: fallbackZone(
    process.env.NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_TOP,
    process.env.NEXT_PUBLIC_MONETAG_ZONE_DEPORTES,
  ),
  DEPORTES_MID: fallbackZone(
    process.env.NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_MID,
    process.env.NEXT_PUBLIC_MONETAG_ZONE_DEPORTES,
  ),
  CATALOG_TOP: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_CATALOG),
  ENVIVO_TOP: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_ENVIVO),
  PLAYER_BOTTOM: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_PLAYER),
  ADGATE_TOP: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_ADGATE_TOP),
  ADGATE_MID: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_ADGATE_MID),
  ADGATE_BOTTOM: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_ADGATE_BOTTOM),
  PREROLL: fallbackZone(process.env.NEXT_PUBLIC_MONETAG_ZONE_PREROLL),
} as const;

export type MonetagZoneKey = keyof typeof MONETAG_ZONES;

export function resolveZoneId(
  zoneId?: string | null,
  fallbackKey?: MonetagZoneKey,
): string {
  if (zoneId) return zoneId;
  if (fallbackKey && MONETAG_ZONES[fallbackKey]) {
    return MONETAG_ZONES[fallbackKey];
  }
  return fallbackZone();
}

export function getInvokeScriptUrl(zoneId: string): string {
  const custom = env(process.env.NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT);
  if (custom) return custom;
  return `https://www.highperformanceformat.com/${zoneId}/invoke.js`;
}

/** Abre Direct Link en nueva pestaña (pre-roll / mid-roll). No bloquea el hilo principal. */
export function openDirectLink(): void {
  if (typeof window === "undefined" || !DIRECT_LINK_URL) return;
  window.open(DIRECT_LINK_URL, "_blank", "noopener,noreferrer");
}

export function buildBannerAdHtml(
  zone: string,
  invokeUrl: string,
  minHeight = 250,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<script async="async" data-cfasync="false" src="${invokeUrl}"><\/script>
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
</style>
</head>
<body><div id="container-${zone}"></div></body>
</html>`;
}
