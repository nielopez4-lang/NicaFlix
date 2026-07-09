import {
  CURATED_LIVE_CHANNELS,
  cleanChannelName,
  inferChannelNetwork,
} from "@/lib/live-channels";
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

type ParsedChannel = { nombre: string; streamUrl: string; logo?: string };

function parseExtInf(line: string): { nombre: string; logo?: string } {
  const tvgName = line.match(/tvg-name="([^"]+)"/)?.[1];
  const tvgLogo = line.match(/tvg-logo="([^"]+)"/)?.[1];
  const commaName = line.match(/,(.+)$/)?.[1]?.trim();
  const raw = commaName || tvgName || "Canal";
  return {
    nombre: cleanChannelName(raw),
    logo: tvgLogo,
  };
}

function parseM3u(text: string): ParsedChannel[] {
  const lines = text.split("\n");
  const channels: ParsedChannel[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF:")) continue;
    const { nombre, logo } = parseExtInf(lines[i]);
    const url = lines[i + 1]?.trim();
    if (!url || url.startsWith("#")) continue;
    channels.push({ nombre, streamUrl: url, logo });
  }
  return channels;
}

function channelLogo(nombre: string, custom?: string): string {
  if (custom?.startsWith("http")) return custom;
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
  const seenUrls = new Set<string>();
  let id = 0;

  const addChannel = (partial: Omit<LiveChannel, "id" | "logo"> & { logo?: string }) => {
    if (!partial.streamUrl.startsWith("http") || seenUrls.has(partial.streamUrl)) {
      return;
    }
    seenUrls.add(partial.streamUrl);
    id++;
    const channel: LiveChannel = {
      id: `live-${id}`,
      nombre: partial.nombre,
      red: partial.red ?? inferChannelNetwork(partial.nombre),
      logo: channelLogo(partial.nombre, partial.logo),
      streamUrl: partial.streamUrl,
      categoria: partial.categoria,
      pais: partial.pais,
    };
    const isSports =
      partial.categoria === "Deportes" ||
      /sport|deport|mlb|baseball|beisbol|espn|fox deport|bein|strike/i.test(
        partial.nombre,
      );
    if (isSports) {
      deportesCanales.push(channel);
      if (/mlb|baseball|strike|beisbol/i.test(partial.nombre)) {
        eventosDeportes.push({
          id: `evt-${id}`,
          titulo: channel.nombre,
          hora: "Programación MLB / deportes",
          enVivo: true,
          streamUrl: channel.streamUrl,
          canalId: channel.id,
        });
      }
    } else {
      lives.push(channel);
    }
  };

  for (const curated of CURATED_LIVE_CHANNELS) {
    addChannel(curated);
  }

  for (const { code, pais } of COUNTRY_PLAYLISTS) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/iptv-org/iptv/master/streams/${code}.m3u`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) continue;
      const channels = parseM3u(await res.text()).slice(0, 15);
      for (const ch of channels) {
        addChannel({
          nombre: ch.nombre,
          streamUrl: ch.streamUrl,
          logo: ch.logo,
          categoria: pais,
          pais,
          red: inferChannelNetwork(ch.nombre),
        });
      }
    } catch {
      /* playlist unavailable */
    }
  }

  return { lives, deportesCanales, eventosDeportes };
}
