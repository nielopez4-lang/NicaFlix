import Image from "next/image";
import Link from "next/link";
import { DownloadButtons } from "@/components/DownloadButtons";
import { NativeAdSlot } from "@/components/MonetagScript";
import { CatalogPreview } from "@/components/CatalogPreview";
import { LivePreview } from "@/components/LivePreview";

export const dynamic = "force-dynamic";

const features = [
  { title: "Inicio", desc: "Películas, series, anime y zona infantil." },
  { title: "En Vivo", desc: "Canales de TV de Latinoamérica y EE.UU. (iptv-org)." },
  { title: "Deportes", desc: "Canales deportivos incl. MLB Strike Zone y más." },
  { title: "Gratis", desc: "Sin suscripción — monetización solo con anuncios." },
];

export default function HomePage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <NativeAdSlot id="ad-top-banner" label="Banner superior" />
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
              100% gratis. Catálogo cargado desde Internet Archive, anime
              popular y canales en vivo de código abierto.
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
        <NativeAdSlot id="ad-native-mid" label="Anuncio nativo" />
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
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <NativeAdSlot id="ad-bottom-banner" label="Banner inferior" />
      </div>
    </main>
  );
}
