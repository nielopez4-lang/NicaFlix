import { fetchLiveChannels } from "@/lib/iptv";
import { liveChannelSubtitle } from "@/lib/live-channels";
import { AdSlot } from "@/components/AdSlot";
import type { LiveChannel } from "@/types/content";
import Link from "next/link";

function ChannelCard({ ch }: { ch: LiveChannel }) {
  return (
    <Link
      href={`/envivo/${ch.id}`}
      className="glass rounded-xl p-4 transition hover:bg-white/10"
    >
      <p className="font-medium">{ch.nombre}</p>
      <p className="mt-1 text-xs text-brand-muted">{liveChannelSubtitle(ch)}</p>
    </Link>
  );
}

export default async function EnVivoPage() {
  const { lives } = await fetchLiveChannels();
  const clasicos = lives.filter((ch) => ch.categoria === "Clásicos");
  const otros = lives.filter((ch) => ch.categoria !== "Clásicos");
  const byCountry = otros.reduce<Record<string, typeof otros>>((acc, ch) => {
    (acc[ch.pais] ??= []).push(ch);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">TV en vivo</h1>
      <p className="mt-2 text-brand-muted">
        El Chavo del 8, Televisa, Canal 8, TV Azteca y más — Nicaragua, LATAM y EE.UU.
      </p>

      <AdSlot slot="ENVIVO_TOP" className="my-8" />

      {clasicos.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-brand-red">
            Chespirito & clásicos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {clasicos.map((ch) => (
              <ChannelCard key={ch.id} ch={ch} />
            ))}
          </div>
        </section>
      )}

      {Object.entries(byCountry).map(([pais, channels]) => (
        <section key={pais} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-brand-red">{pais}</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {channels.map((ch) => (
              <ChannelCard key={ch.id} ch={ch} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
