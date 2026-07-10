import { fetchFullCatalog } from "@/lib/catalog";
import { CATALOG_LABELS, CATALOG_ORDER } from "@/lib/catalog-labels";
import { AdSlot } from "@/components/AdSlot";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const catalogo = await fetchFullCatalog();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Catálogo completo</h1>
      <p className="mt-2 text-brand-muted">
        {catalogo.length} títulos — estrenos en español HD, FilmRise, Internet
        Archive y anime
      </p>

      <AdSlot slot="CATALOG_TOP" className="my-8" />

      {CATALOG_ORDER.map((key) => {
        const label = CATALOG_LABELS[key];
        const items = catalogo.filter((c) => c.categoria === key);
        if (!items.length) return null;
        return (
          <section key={key} className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">{label}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              {items.map((item) => (
                <Link key={item.id} href={`/ver/${item.id}`} className="group">
                  <Image
                    src={item.portada}
                    alt={item.titulo}
                    width={200}
                    height={280}
                    className="aspect-[2/3] w-full rounded-xl object-cover transition group-hover:ring-2 group-hover:ring-brand-red"
                    unoptimized
                  />
                  <p className="mt-2 line-clamp-2 text-sm">{item.titulo}</p>
                  {item.fuente === "spanish-cinema" && (
                    <p className="text-xs text-brand-red">Estreno ES · HD · {item.anio}</p>
                  )}
                  {item.fuente === "filmrise" && (
                    <p className="text-xs text-brand-muted">FilmRise · {item.anio}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
