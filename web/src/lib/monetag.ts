/** Re-exporta configuración centralizada (compatibilidad) */
export {
  ANDROID_APK_URL,
  DIRECT_LINK_URL as MONETAG_DIRECT_LINK,
  DIRECT_LINK_ZONE_ID,
  IOS_APP_URL,
  MONETAG_GLOBAL,
  MONETAG_ZONES,
  SITE_URL,
  VIDEO_AD,
  buildBannerAdHtml,
  buildSlotAdHtml,
  getInvokeScriptUrl,
  openDirectLink,
  openDirectLink as openMonetagAd,
  resolveZoneId,
} from "@/lib/monetag-config";

import { getPublicEnv } from "@/lib/env";
import { MONETAG_GLOBAL, VIDEO_AD } from "@/lib/monetag-config";
import { getInvokeScriptUrl } from "@/lib/monetag-config";

export const MONETAG_ZONE_ID = MONETAG_GLOBAL.zoneId;
export const MONETAG_SCRIPT_SRC = MONETAG_GLOBAL.scriptSrc;
export const MONETAG_SCRIPT_IPP = MONETAG_GLOBAL.scriptIpp;
export const MONETAG_VERIFY = MONETAG_GLOBAL.verify;

export const MONETAG_BANNER_ZONE =
  getPublicEnv("NEXT_PUBLIC_MONETAG_ZONE_BANNER") || MONETAG_GLOBAL.zoneId;

export const MONETAG_INVOKE_SCRIPT =
  getPublicEnv("NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT") ||
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
