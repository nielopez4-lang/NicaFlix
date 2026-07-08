import { fetchLiveChannels } from "@/lib/iptv";
import Link from "next/link";

export async function LivePreview() {
  const data = await fetchLiveChannels();
  const lives = data?.lives?.slice(0, 8) ?? [];
  const deportes = data?.deportesCanales?.slice(0, 6) ?? [];

  return (
    <section className="border-y border-white/5 bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">En vivo</h2>
          <Link href="/envivo" className="text-brand-red hover:underline">
            Todos los canales
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {lives.map(
            (ch: { id: string; nombre: string; pais: string }) => (
              <Link
                key={ch.id}
                href={`/envivo/${ch.id}`}
                className="glass rounded-xl p-4 transition hover:bg-white/10"
              >
                <p className="font-semibold">{ch.nombre}</p>
                <p className="text-xs text-brand-muted">{ch.pais}</p>
              </Link>
            ),
          )}
        </div>

        {deportes.length > 0 && (
          <>
            <h3 className="mb-4 mt-10 text-xl font-bold">Deportes / MLB</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {deportes.map(
                (ch: { id: string; nombre: string }) => (
                  <Link
                    key={ch.id}
                    href={`/envivo/${ch.id}`}
                    className="rounded-xl border border-brand-red/30 bg-brand-red/10 p-4 transition hover:bg-brand-red/20"
                  >
                    <p className="font-semibold">{ch.nombre}</p>
                  </Link>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
