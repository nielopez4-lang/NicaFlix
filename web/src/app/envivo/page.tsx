import { fetchLiveChannels } from "@/lib/iptv";
import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";

export default async function EnVivoPage() {
  const { lives } = await fetchLiveChannels();
  const byCountry = lives.reduce<Record<string, typeof lives>>((acc, ch) => {
    (acc[ch.pais] ??= []).push(ch);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">TV en vivo</h1>
      <p className="mt-2 text-brand-muted">
        Canales de código abierto (iptv-org) — Nicaragua, México, Centroamérica y más
      </p>

      <AdSlot slot="ENVIVO_TOP" className="my-8" />

      {Object.entries(byCountry).map(([pais, channels]) => (
        <section key={pais} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-brand-red">{pais}</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {channels.map((ch) => (
              <Link
                key={ch.id}
                href={`/envivo/${ch.id}`}
                className="glass rounded-xl p-4 transition hover:bg-white/10"
              >
                <p className="font-medium">{ch.nombre}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
