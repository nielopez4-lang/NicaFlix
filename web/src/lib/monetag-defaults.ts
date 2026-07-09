/** Valores Monetag de NicaFlix — sincronizados desde producción (fallback si Vercel no tiene env). */
export const MONETAG_DEFAULTS = {
  zoneId: "258015",
  directLink: "https://quge5.com/4/258015",
  directLinkZone: "258015",
  siteUrl: "https://web-five-plum-og6kinpc9v.vercel.app",
  verify: "6c34729c43bee7297fd3f09cf22ea9ab",
  invokeScript: "https://www.highperformanceformat.com/258015/invoke.js",
  multitagScript: "https://quge5.com/88/tag.min.js",
  androidApkUrl:
    "https://expo.dev/artifacts/eas/C0eyFiPrbZY3JAjItEdnfI8_qDmK2pbiXePmR-Lw0gA.apk",
} as const;
