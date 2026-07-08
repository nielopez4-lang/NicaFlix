import type { SportsResponse } from "@/types/content";
import { getExpoEnv } from "@/lib/env";

const API_BASE =
  getExpoEnv("EXPO_PUBLIC_API_URL") || "http://localhost:3000";

export async function fetchSports(): Promise<SportsResponse> {
  const res = await fetch(`${API_BASE}/api/sports`);
  if (!res.ok) throw new Error("sports");
  return res.json();
}
