import { fetchLiveChannels } from "@/lib/iptv";
import { fetchSportsData } from "@/lib/sports";
import { LiveScoreGrid, LiveScoreTicker } from "@/components/LiveScoreTicker";
import { MlbStandingsPanel, SoccerStandingsPanel } from "@/components/StandingsTables";
import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";

export default async function DeportesPage() {
  const [{ deportesCanales }, sports] = await Promise.all([
    fetchLiveChannels(),
    fetchSportsData(),
  ]);

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 pb-24">
        <h1 className="text-4xl font-bold">Deportes</h1>
        <p className="mt-2 text-brand-muted">
          MLB en vivo, fútbol internacional, tablas y canales deportivos
        </p>

        <AdSlot slot="DEPORTES_TOP" className="mt-8" />

        {sports.liveScores.length > 0 && (
          <section className="mt-6 rounded-xl border border-brand-red/40 bg-brand-red/5 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-red" />
              Partidos en vivo ahora
            </h2>
            <LiveScoreGrid live={sports.liveScores} upcoming={[]} />
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Marcadores del día</h2>
          <LiveScoreGrid
            live={sports.liveScores}
            upcoming={sports.upcoming}
          />
        </section>

        <section className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Tabla MLB</h2>
            <MlbStandingsPanel rows={sports.mlbStandings} />
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Fútbol — Ligas internacionales
            </h2>
            <SoccerStandingsPanel rows={sports.soccerStandings} />
          </div>
        </section>

        <AdSlot slot="DEPORTES_MID" className="my-10" minHeight={280} />

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Canales deportivos</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {deportesCanales.map((ch) => (
              <Link
                key={ch.id}
                href={`/envivo/${ch.id}`}
                className="glass rounded-xl p-4 transition hover:bg-white/10"
              >
                <p className="font-medium">{ch.nombre}</p>
                <p className="text-xs text-brand-muted">{ch.pais}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <LiveScoreTicker initialLive={sports.liveScores} />
    </>
  );
}
