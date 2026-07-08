import { fetchLiveChannels } from "@/lib/iptv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchLiveChannels();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { lives: [], deportesCanales: [], eventosDeportes: [], error: "Error" },
      { status: 500 },
    );
  }
}
