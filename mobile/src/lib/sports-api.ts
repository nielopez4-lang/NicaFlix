import type { SportsResponse } from "@/types/content";
import { getExpoEnv } from "@/lib/env";

const PRODUCTION_WEB =
  "https://web-five-plum-og6kinpc9v.vercel.app";

const API_BASE =
  getExpoEnv("EXPO_PUBLIC_API_URL") || PRODUCTION_WEB;

export async function fetchSports(): Promise<SportsResponse> {
  const res = await fetch(`${API_BASE}/api/sports`);
  if (!res.ok) throw new Error("sports");
  return res.json();
}
