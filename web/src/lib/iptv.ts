import type { LiveChannel, SportEvent } from "@/types/content";

const COUNTRY_PLAYLISTS = [
  { code: "ni", pais: "Nicaragua" },
  { code: "mx", pais: "México" },
  { code: "gt", pais: "Guatemala" },
  { code: "sv", pais: "El Salvador" },
  { code: "hn", pais: "Honduras" },
  { code: "cr", pais: "Costa Rica" },
  { code: "co", pais: "Colombia" },
  { code: "pa", pais: "Panamá" },
  { code: "do", pais: "Rep. Dominicana" },
  { code: "us", pais: "EE.UU." },
];

function parseM3u(text: string): { nombre: string; streamUrl: string }[] {
  const lines = text.split("\n");
  const channels: { nombre: string; streamUrl: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF:")) continue;
    const nameMatch = lines[i].match(/,(.+)$/);
    const url = lines[i + 1]?.trim();
    if (!url || url.startsWith("#")) continue;
    channels.push({
      nombre: nameMatch?.[1]?.trim() ?? "Canal",
      streamUrl: url,
    });
  }
  return channels;
}

function channelLogo(nombre: string): string {
  const initials = nombre.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2) || "TV";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0B0B0F&color=E50914&size=128&bold=true`;
}

export async function fetchLiveChannels(): Promise<{
  lives: LiveChannel[];
  deportesCanales: LiveChannel[];
  eventosDeportes: SportEvent[];
}> {
  const lives: LiveChannel[] = [];
  const deportesCanales: LiveChannel[] = [];
  const eventosDeportes: SportEvent[] = [];
  let id = 0;

  for (const { code, pais } of COUNTRY_PLAYLISTS) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/iptv-org/iptv/master/streams/${code}.m3u`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) continue;
      const channels = parseM3u(await res.text()).slice(0, 15);
      for (const ch of channels) {
        if (!ch.streamUrl.startsWith("http")) continue;
        id++;
        const isSports = /sport|deport|mlb|baseball|beisbol|espn|fox deport|bein|strike/i.test(
          ch.nombre,
        );
        const channel: LiveChannel = {
          id: `live-${id}`,
          nombre: ch.nombre,
          logo: channelLogo(ch.nombre),
          streamUrl: ch.streamUrl,
          categoria: isSports ? "Deportes" : pais,
          pais,
        };
        if (isSports) {
          deportesCanales.push(channel);
          if (/mlb|baseball|strike|beisbol/i.test(ch.nombre)) {
            eventosDeportes.push({
              id: `evt-${id}`,
              titulo: ch.nombre,
              hora: "Programación MLB / deportes",
              enVivo: true,
              streamUrl: ch.streamUrl,
              canalId: channel.id,
            });
          }
        } else {
          lives.push(channel);
        }
      }
    } catch {
      /* playlist unavailable */
    }
  }

  return { lives, deportesCanales, eventosDeportes };
}
