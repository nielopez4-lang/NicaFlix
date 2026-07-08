import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import Image from "next/image";
import Link from "next/link";

const labels: Record<string, string> = {
  peliculas: "Películas",
  series: "Series",
  anime: "Anime",
  kids: "Zona Infantil",
};

export async function CatalogPreview() {
  const [archive, anime] = await Promise.all([
    fetchArchiveCatalog(),
    fetchJikanAnime(),
  ]);
  const catalogo = [...archive, ...anime];
  const data = { catalogo };

  if (!data.catalogo.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-brand-muted">Catálogo se carga al iniciar el servidor...</p>
      </section>
    );
  }

  const grouped = Object.keys(labels).map((key) => ({
    key,
    label: labels[key],
    items: data.catalogo.filter(
      (c: { categoria: string }) => c.categoria === key,
    ),
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
                {items.slice(0, 12).map(
                  (item: {
                    id: string;
                    titulo: string;
                    portada: string;
                  }) => (
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
                  ),
                )}
              </div>
            </div>
          ),
      )}
    </section>
  );
}
