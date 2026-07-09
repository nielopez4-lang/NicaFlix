import AdContainer from "@/components/AdContainer";
import { MONETAG_ZONES, type MonetagZoneKey } from "@/lib/monetag-config";

type Props = {
  /** Clave del slot en MONETAG_ZONES */
  slot: MonetagZoneKey;
  className?: string;
  minHeight?: number;
  /** Banner nativo inline en el documento (usar 1 vez por página). */
  preferInline?: boolean;
};

/** Atajo tipado: `<AdSlot slot="HOME_TOP" />` → `<AdContainer zoneId={...} />` */
export function AdSlot({
  slot,
  className = "",
  minHeight = 250,
  preferInline = false,
}: Props) {
  return (
    <AdContainer
      zoneId={MONETAG_ZONES[slot]}
      slotKey={slot}
      className={className}
      minHeight={minHeight}
      preferInline={preferInline}
    />
  );
}

export { AdContainer, MONETAG_ZONES };
