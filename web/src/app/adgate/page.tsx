import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default function AdGatePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <AdSlot slot="ADGATE_TOP" className="my-4" />
      <AdSlot slot="ADGATE_MID" className="my-4" />
      <AdSlot slot="ADGATE_BOTTOM" className="my-4" />
    </main>
  );
}
