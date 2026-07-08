import {
  DIRECT_LINK_URL,
  DIRECT_LINK_ZONE_ID,
  MONETAG_GLOBAL,
  MONETAG_ZONES,
  VIDEO_AD,
  buildBannerAdHtml,
  getInvokeScriptUrl,
  openDirectLink,
  resolveZoneId,
} from "@/lib/monetag-config";

export {
  DIRECT_LINK_URL as MONETAG_DIRECT_LINK,
  DIRECT_LINK_ZONE_ID,
  MONETAG_GLOBAL,
  MONETAG_ZONES,
  VIDEO_AD,
  buildBannerAdHtml,
  getInvokeScriptUrl,
  openDirectLink,
  openDirectLink as openMonetagAd,
  resolveZoneId,
};

export const MONETAG_ZONE_ID = MONETAG_GLOBAL.zoneId;
export const MONETAG_SCRIPT_SRC = MONETAG_GLOBAL.scriptSrc;
export const MONETAG_SCRIPT_IPP = MONETAG_GLOBAL.scriptIpp;
export const MONETAG_VERIFY = MONETAG_GLOBAL.verify;

export const MONETAG_BANNER_ZONE =
  process.env.NEXT_PUBLIC_MONETAG_ZONE_BANNER?.trim() ||
  MONETAG_GLOBAL.zoneId;

export const MONETAG_INVOKE_SCRIPT =
  process.env.NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT?.trim() ||
  (MONETAG_BANNER_ZONE
    ? `https://www.highperformanceformat.com/${MONETAG_BANNER_ZONE}/invoke.js`
    : "");

export const AD_GATE_SECONDS = VIDEO_AD.prerollSeconds;
export const AD_INTERVAL_MS = VIDEO_AD.midrollIntervalMs;

export function getBannerZoneId(): string {
  return MONETAG_BANNER_ZONE;
}

export function getBannerInvokeUrl(): string {
  return getInvokeScriptUrl(getBannerZoneId());
}
