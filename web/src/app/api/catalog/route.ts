import { fetchArchiveCatalog, fetchJikanAnime } from "@/lib/archive";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [archive, anime] = await Promise.all([
      fetchArchiveCatalog(),
      fetchJikanAnime(),
    ]);
    const catalogo = [...archive, ...anime];
    const stats = {
      peliculas: catalogo.filter((c) => c.categoria === "peliculas").length,
      series: catalogo.filter((c) => c.categoria === "series").length,
      anime: catalogo.filter((c) => c.categoria === "anime").length,
      kids: catalogo.filter((c) => c.categoria === "kids").length,
      total: catalogo.length,
    };
    return NextResponse.json({ catalogo, stats });
  } catch {
    return NextResponse.json(
      { catalogo: [], stats: {}, error: "No se pudo cargar el catálogo" },
      { status: 500 },
    );
  }
}
