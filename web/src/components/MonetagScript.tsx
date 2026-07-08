"use client";

import AdContainer from "@/components/AdContainer";
import { MONETAG_ZONES, type MonetagZoneKey } from "@/lib/monetag-config";

const SLOT_KEYS: Record<string, MonetagZoneKey> = {
  "ad-top-banner": "HOME_TOP",
  "ad-native-mid": "HOME_MID",
  "ad-home-feature": "HOME_FEATURE",
  "ad-bottom-banner": "HOME_BOTTOM",
  "ad-deportes-mid": "DEPORTES_MID",
  "ad-catalog-top": "CATALOG_TOP",
  "ad-envivo-top": "ENVIVO_TOP",
  "ad-player-bottom": "PLAYER_BOTTOM",
  "ad-adgate-top": "ADGATE_TOP",
  "ad-adgate-mid": "ADGATE_MID",
  "ad-adgate-bottom": "ADGATE_BOTTOM",
};

/** @deprecated Usar `<AdSlot slot="..." />` o `<AdContainer zoneId="..." />` */
export function NativeAdSlot({
  id,
  label: _label,
  className = "",
  tall = false,
}: {
  id: string;
  label: string;
  className?: string;
  tall?: boolean;
}) {
  const key = SLOT_KEYS[id];
  const zoneId = key ? MONETAG_ZONES[key] : "";

  return (
    <AdContainer
      zoneId={zoneId}
      className={className}
      minHeight={tall ? 280 : 250}
    />
  );
}

export { AdContainer, MONETAG_ZONES };
