import type { CatalogResponse, LiveResponse } from "../../../shared/types";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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
