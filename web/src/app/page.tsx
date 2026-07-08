import Image from "next/image";
import Link from "next/link";
import { AdBanner } from "@/components/AdBanner";
import { AdSlot } from "@/components/AdSlot";
import { DownloadButtons } from "@/components/DownloadButtons";
import { CatalogPreview } from "@/components/CatalogPreview";
import { LivePreview } from "@/components/LivePreview";

export const dynamic = "force-dynamic";

const features = [
  { title: "Acción y más", desc: "FilmRise Movies: acción, comedia, familia y terror." },
  { title: "En Vivo", desc: "Canales de TV de Latinoamérica y EE.UU. (iptv-org)." },
  { title: "Deportes", desc: "Canales deportivos incl. MLB Strike Zone y más." },
];

export default function HomePage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <AdBanner className="mb-4" />
      </div>

      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <Image
              src="/logo.png"
              alt="NicaFlix"
              width={120}
              height={120}
              className="mb-6 rounded-3xl shadow-2xl shadow-brand-red/20"
              priority
            />
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-red">
              Streaming para Latinoamérica y EE.UU.
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Películas, series, en vivo y deportes
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-muted">
              100% gratis. Películas FilmRise por categoría (acción, comedia,
              familia, terror), Internet Archive, anime y TV en vivo.
            </p>
            <div id="descargar" className="mt-8">
              <DownloadButtons />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <Link
              href="/catalogo"
              className="glass rounded-2xl px-6 py-4 text-center font-semibold transition hover:bg-white/10"
            >
              Ver catálogo completo →
            </Link>
            <Link
              href="/envivo"
              className="glass rounded-2xl px-6 py-4 text-center font-semibold transition hover:bg-white/10"
            >
              Canales en vivo →
            </Link>
            <Link
              href="/deportes"
              className="rounded-2xl bg-brand-red px-6 py-4 text-center font-semibold transition hover:bg-red-600"
            >
              Deportes y MLB →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <AdSlot slot="HOME_MID" />
      </div>

      <CatalogPreview />

      <LivePreview />

      <section id="contenido" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Todo incluido — sin suscripción</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <article key={f.title} className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-brand-muted">{f.desc}</p>
            </article>
          ))}
          <AdSlot slot="HOME_FEATURE" minHeight={280} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <AdSlot slot="HOME_BOTTOM" minHeight={280} />
      </div>
    </main>
  );
}
