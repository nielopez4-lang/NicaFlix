import { fetchCatalogResponse } from "@/lib/catalog";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchCatalogResponse();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { catalogo: [], stats: {}, error: "No se pudo cargar el catálogo" },
      { status: 500 },
    );
  }
}
