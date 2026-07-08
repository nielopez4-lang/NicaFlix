import { fetchLiveChannels } from "@/lib/iptv";
import { NativeAdSlot } from "@/components/MonetagScript";
import Link from "next/link";

export default async function DeportesPage() {
  const { deportesCanales, eventosDeportes } = await fetchLiveChannels();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Deportes</h1>
      <p className="mt-2 text-brand-muted">
        Canales deportivos y MLB — algunos pueden estar geo-bloqueados o fuera de línea
      </p>

      {eventosDeportes.length === 0 ? (
        <div className="glass mt-10 rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold">
            No hay eventos MLB activos en este momento
          </p>
          <p className="mt-2 text-brand-muted">Consulta los canales deportivos abajo</p>
        </div>
      ) : (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">MLB / Béisbol</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {eventosDeportes.map((evt) => (
              <Link
                key={evt.id}
                href={evt.canalId ? `/envivo/${evt.canalId}` : "#"}
                className="flex items-center justify-between rounded-xl bg-brand-red/15 border border-brand-red/30 p-5 transition hover:bg-brand-red/25"
              >
                <div>
                  <p className="font-semibold">{evt.titulo}</p>
                  <p className="text-sm text-brand-muted">{evt.hora}</p>
                </div>
                <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-bold">
                  EN VIVO
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <NativeAdSlot id="ad-deportes-mid" label="Anuncio deportes" className="my-10" />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Todos los canales deportivos</h2>
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

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {["Resultados", "Tabla de posiciones", "Próximos partidos"].map((tab) => (
          <div key={tab} className="glass rounded-xl p-4">
            <p className="mb-3 font-semibold">{tab}</p>
            <NativeAdSlot
              id={`ad-dep-${tab.replace(/\s/g, "-").toLowerCase()}`}
              label={tab}
              className="min-h-[180px]"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
