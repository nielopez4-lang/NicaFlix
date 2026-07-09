import { fetchCatalog, fetchLive } from "@/lib/api";
import { canalesNicaragua, deportesSeed } from "@/lib/seed";
import type { ContentItem, LiveChannel, SportEvent } from "@/types/content";

export type { ContentItem, LiveChannel, SportEvent };

export async function loadCatalog(): Promise<ContentItem[]> {
  try {
    const data = await fetchCatalog();
    return data.catalogo;
  } catch {
    return [];
  }
}

export async function loadLiveData(): Promise<{
  lives: LiveChannel[];
  deportesCanales: LiveChannel[];
  eventosDeportes: SportEvent[];
}> {
  try {
    return await fetchLive();
  } catch {
    const lives: LiveChannel[] = canalesNicaragua.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      red: c.red,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre.slice(0, 2))}&background=E50914&color=fff`,
      streamUrl: c.streamUrl,
      categoria: c.categoria ?? c.pais,
      pais: c.pais,
    }));
    const deportesCanales: LiveChannel[] = deportesSeed.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      logo: `https://ui-avatars.com/api/?name=SP&background=1a1a2e&color=E50914`,
      streamUrl: c.streamUrl,
      categoria: "Deportes",
      pais: c.pais,
    }));
    const eventosDeportes: SportEvent[] = deportesSeed
      .filter((c) => /mlb|fox|sport|deport/i.test(c.nombre))
      .map((c) => ({
        id: `evt-${c.id}`,
        titulo: c.nombre,
        hora: "Programación deportiva",
        enVivo: true,
        streamUrl: c.streamUrl,
        canalId: c.id,
      }));
    return { lives, deportesCanales, eventosDeportes };
  }
}

export async function findChannel(id: string): Promise<LiveChannel | undefined> {
  const data = await loadLiveData();
  return [...data.lives, ...data.deportesCanales].find((c) => c.id === id);
}

export async function findContent(id: string): Promise<ContentItem | undefined> {
  const catalogo = await loadCatalog();
  return catalogo.find((c) => c.id === id);
}
