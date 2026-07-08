import { fetchSportsData } from "@/lib/sports";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchSportsData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        liveScores: [],
        upcoming: [],
        mlbStandings: [],
        soccerStandings: [],
        updatedAt: new Date().toISOString(),
        error: "No se pudieron cargar estadísticas",
      },
      { status: 500 },
    );
  }
}
