import type { CatalogResponse, LiveResponse } from "@/types/content";
import { getExpoEnv } from "@/lib/env";

const PRODUCTION_WEB =
  "https://web-five-plum-og6kinpc9v.vercel.app";

const API_BASE =
  getExpoEnv("EXPO_PUBLIC_API_URL") || PRODUCTION_WEB;

export async function fetchCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${API_BASE}/api/catalog`);
  if (!res.ok) throw new Error("catalog");
  return res.json();
}

export async function fetchLive(): Promise<LiveResponse> {
  const res = await fetch(`${API_BASE}/api/live`);
  if (!res.ok) throw new Error("live");
  return res.json();
}
