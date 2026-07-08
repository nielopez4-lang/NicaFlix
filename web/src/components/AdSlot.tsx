import AdContainer from "@/components/AdContainer";
import { MONETAG_ZONES, type MonetagZoneKey } from "@/lib/monetag-config";

type Props = {
  /** Clave del slot en MONETAG_ZONES */
  slot: MonetagZoneKey;
  className?: string;
  minHeight?: number;
};

/** Atajo tipado: `<AdSlot slot="HOME_TOP" />` → `<AdContainer zoneId={...} />` */
export function AdSlot({ slot, className = "", minHeight = 250 }: Props) {
  return (
    <AdContainer
      zoneId={MONETAG_ZONES[slot]}
      className={className}
      minHeight={minHeight}
    />
  );
}

export { AdContainer, MONETAG_ZONES };
