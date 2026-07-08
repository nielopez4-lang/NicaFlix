import { fetchFullCatalog } from "@/lib/catalog";
import { CATALOG_LABELS, CATALOG_ORDER } from "@/lib/catalog-labels";
import Image from "next/image";
import Link from "next/link";

export async function CatalogPreview() {
  const catalogo = await fetchFullCatalog();

  if (!catalogo.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-brand-muted">Catálogo se carga al iniciar el servidor...</p>
      </section>
    );
  }

  const grouped = CATALOG_ORDER.map((key) => ({
    key,
    label: CATALOG_LABELS[key],
    items: catalogo.filter((c) => c.categoria === key),
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-3xl font-bold">Catálogo</h2>
        <Link href="/catalogo" className="text-brand-red hover:underline">
          Ver todo
        </Link>
      </div>
      {grouped.map(
        ({ key, label, items }) =>
          items.length > 0 && (
            <div key={key} className="mb-10">
              <h3 className="mb-4 text-lg text-brand-muted">{label}</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {items.slice(0, 12).map((item) => (
                  <Link
                    key={item.id}
                    href={`/ver/${item.id}`}
                    className="w-36 shrink-0"
                  >
                    <Image
                      src={item.portada}
                      alt={item.titulo}
                      width={144}
                      height={200}
                      className="h-48 w-36 rounded-xl object-cover"
                      unoptimized
                    />
                    <p className="mt-2 line-clamp-2 text-xs text-brand-muted">
                      {item.titulo}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ),
      )}
    </section>
  );
}
