import type { LiveChannel } from "@/types/content";

/** Canales curados: Chespirito, Televisa, clásicos LATAM */
export const CURATED_LIVE_CHANNELS: Omit<LiveChannel, "id" | "logo">[] = [
  {
    nombre: "El Chavo del 8",
    red: "El Chavo TV",
    streamUrl:
      "https://live20.bozztv.com/giatvplayout7/giatv-211465/playlist.m3u8",
    categoria: "Clásicos",
    pais: "México",
  },
  {
    nombre: "Distrito Comedia",
    red: "Televisa",
    streamUrl: "http://177.234.249.135:8888/DistritoComedia/index.m3u8",
    categoria: "Clásicos",
    pais: "México",
  },
  {
    nombre: "Las Estrellas",
    red: "Televisa",
    streamUrl: "http://177.234.249.135:8888/LasEstrellas/index.m3u8",
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    nombre: "Canal 5",
    red: "Televisa",
    streamUrl: "http://190.11.225.124:5000/live/canal5_hd/playlist.m3u8",
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    nombre: "Tlnovelas",
    red: "Televisa",
    streamUrl: "http://177.234.249.135:8888/Telenovelas/index.m3u8",
    categoria: "Clásicos",
    pais: "México",
  },
  {
    nombre: "Canal 8 La Paz",
    red: "Canal 8",
    streamUrl: "https://s5.mexside.net:1936/xhbzc81/xhbzc81/playlist.m3u8",
    categoria: "Regional",
    pais: "México",
  },
  {
    nombre: "8NTV",
    red: "Canal 8",
    streamUrl: "https://60417ddeaf0d9.streamlock.net/ntv/videontv/playlist.m3u8",
    categoria: "Regional",
    pais: "México",
  },
  {
    nombre: "Azteca Uno",
    red: "TV Azteca",
    streamUrl: "http://45.189.62.33:8002/play/a0cc/index.m3u8",
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    nombre: "Azteca 7",
    red: "TV Azteca",
    streamUrl: "http://45.189.62.33:8002/play/a0fm/index.m3u8",
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    nombre: "Imagen TV",
    red: "Imagen Televisión",
    streamUrl: "https://igd-it-runtime.otteravision.com/igd/it/it.m3u8",
    categoria: "Noticias",
    pais: "México",
  },
];

export function inferChannelNetwork(nombre: string): string | undefined {
  const n = nombre.toLowerCase();
  if (/el chavo|chespirito/.test(n)) return "Chespirito · El Chavo TV";
  if (
    /las estrellas|canal 5|distrito comedia|tlnovelas|foro tv|unicable|golden|de pel[ií]cula/.test(
      n,
    )
  )
    return "Televisa";
  if (/azteca|adn 40|a\+/.test(n)) return "TV Azteca";
  if (/canal 8|8ntv/.test(n)) return "Canal 8";
  if (/imagen tv|imagen televisi/.test(n)) return "Imagen Televisión";
  if (/canal 22|capital 21|once/.test(n)) return "TV pública";
  if (/univision|telemundo|galavisi/.test(n)) return "Univision";
  if (/tn8|canal 4|canal 6|canal 13|canal 15|viva nicaragua/.test(n))
    return "Nicaragua";
  if (/espn|fox deport|tudn|bein|mlb|strike/.test(n)) return "Deportes";
  return undefined;
}

export function cleanChannelName(raw: string): string {
  return raw
    .replace(/\s*\(\d+p\)\s*/gi, "")
    .replace(/\s*\[Not 24\/7\]\s*/gi, "")
    .replace(/\s*\[Geo-blocked\]\s*/gi, "")
    .replace(/\s*\[Panregional\]\s*/gi, "")
    .trim();
}

export function liveChannelSubtitle(
  ch: Pick<LiveChannel, "red" | "pais" | "categoria">,
): string {
  const parts = [ch.red, ch.pais, ch.categoria !== ch.pais ? ch.categoria : ""]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  return parts.join(" · ");
}
