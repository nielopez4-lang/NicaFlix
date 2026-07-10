import type { LiveChannel } from "@/types/content";
import { normalizeStreamUrl } from "@/lib/stream-playback";

export type CuratedLiveChannel = Omit<LiveChannel, "id" | "logo"> & {
  /** ID estable para enlaces (/envivo/mx-chavo) */
  id?: string;
  streamFallbacks?: string[];
};

export { normalizeStreamUrl };

/** Canales curados — URLs normalizadas para HTTPS + proxy HLS. */
export const CURATED_LIVE_CHANNELS: CuratedLiveChannel[] = [
  {
    id: "mx-chavo",
    nombre: "El Chavo del 8",
    red: "El Chavo TV",
    streamUrl: normalizeStreamUrl(
      "https://live20.bozztv.com/giatvplayout7/giatv-211465/playlist.m3u8",
    ),
    categoria: "Clásicos",
    pais: "México",
  },
  {
    id: "mx-comedia",
    nombre: "Distrito Comedia",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://177.234.249.135:8888/DistritoComedia/index.m3u8",
    ),
    categoria: "Clásicos",
    pais: "México",
  },
  {
    id: "mx-estrellas",
    nombre: "Las Estrellas",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://177.234.249.135:8888/LasEstrellas/index.m3u8",
    ),
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    id: "mx-canal5",
    nombre: "Canal 5",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://190.11.225.124:5000/live/canal5_hd/playlist.m3u8",
    ),
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    id: "mx-tlnovelas",
    nombre: "Tlnovelas",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://177.234.249.135:8888/Telenovelas/index.m3u8",
    ),
    categoria: "Clásicos",
    pais: "México",
  },
  {
    id: "mx-canal8",
    nombre: "Canal 8 La Paz",
    red: "Canal 8",
    streamUrl: normalizeStreamUrl(
      "https://s5.mexside.net:1936/xhbzc81/xhbzc81/playlist.m3u8",
    ),
    categoria: "Regional",
    pais: "México",
  },
  {
    id: "mx-8ntv",
    nombre: "8NTV",
    red: "Canal 8",
    streamUrl: normalizeStreamUrl(
      "https://60417ddeaf0d9.streamlock.net/ntv/videontv/playlist.m3u8",
    ),
    categoria: "Regional",
    pais: "México",
  },
  {
    id: "mx-azteca1",
    nombre: "Azteca Uno",
    red: "TV Azteca",
    streamUrl: normalizeStreamUrl(
      "http://45.189.62.33:8002/play/a0cc/index.m3u8",
    ),
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    id: "mx-azteca7",
    nombre: "Azteca 7",
    red: "TV Azteca",
    streamUrl: normalizeStreamUrl(
      "http://45.189.62.33:8002/play/a0fm/index.m3u8",
    ),
    categoria: "Entretenimiento",
    pais: "México",
  },
  {
    id: "mx-imagen",
    nombre: "Imagen TV",
    red: "Imagen Televisión",
    streamUrl: normalizeStreamUrl(
      "https://igd-it-runtime.otteravision.com/igd/it/it.m3u8",
    ),
    categoria: "Noticias",
    pais: "México",
  },
  {
    id: "co-55",
    nombre: "Canal 55 Telemorisco",
    red: "Canal 55 · Telemorisco TV",
    streamUrl: normalizeStreamUrl(
      "https://canal.mediaserver.com.co/live/telemorisco.m3u8",
    ),
    categoria: "Entretenimiento",
    pais: "Colombia",
  },
  {
    id: "do-teleantillas10",
    nombre: "Tele Antillas Canal 10",
    red: "Grupo Corripio",
    streamUrl: normalizeStreamUrl(
      "http://45.171.108.253:8888/TELEANTILLAS/index.m3u8",
    ),
    streamFallbacks: ["https://teleantillas.com.do/en-vivo/"],
    categoria: "República Dominicana",
    pais: "Rep. Dominicana",
  },
  {
    id: "do-coral39",
    nombre: "Coral Canal 39",
    red: "Grupo Corripio",
    streamUrl: normalizeStreamUrl(
      "http://190.110.36.254:80/CORAL39/index.m3u8",
    ),
    categoria: "República Dominicana",
    pais: "Rep. Dominicana",
  },
  {
    id: "ni-tn8",
    nombre: "TN8",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://streamingcws30.com/tn8/videotn8/chunks.m3u8",
    ),
    streamFallbacks: [
      normalizeStreamUrl("http://190.61.101.11:7050/play/a07j/index.m3u8"),
    ],
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-canal4",
    nombre: "Canal 4",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/x7rwv8c?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-canal6",
    nombre: "Canal 6 Nicaragüense",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/xaka1oy?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-canal10",
    nombre: "Canal 10",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://d82p4jax9pjrm.cloudfront.net/ts:abr.m3u8",
    ),
    streamFallbacks: ["https://www.canal10.com.ni/envivo/"],
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-canal15",
    nombre: "Canal 15",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/xaka1oy?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-cvision",
    nombre: "Canal Cvisión",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://stream.cvision.live/cvision_stream.m3u8",
    ),
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-cdnn23",
    nombre: "CDNN 23",
    red: "Nicaragua",
    streamUrl: "https://cdnn23live.com/",
    streamFallbacks: [
      normalizeStreamUrl(
        "https://cootv.cootel.com.ni:8095/Canal23_CooTel/playlist.m3u8",
      ),
    ],
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-boaco7",
    nombre: "Canal 7 Boaco",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://cdn.amixtv.com/c7boaco/index.m3u8",
    ),
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-cootel9",
    nombre: "CooTel Nicaragua",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "http://138.117.4.70:8075/channel9/playlist.m3u8",
    ),
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-olam",
    nombre: "Olam Metro TV",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://netzerstreaming.com:4433/hls/olammetro/index.m3u8",
    ),
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-viva13",
    nombre: "Viva Nicaragua Canal 13",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "http://45.171.108.253:8888/VIVA/index.m3u8",
    ),
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
  {
    id: "ni-wtv20",
    nombre: "WTV Canal 20",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://cloudvideo.servers10.com:8081/8130/index.m3u8",
    ),
    streamFallbacks: [
      normalizeStreamUrl(
        "https://cootv.cootel.com.ni:8095/Canal40_WTV/playlist.m3u8",
      ),
    ],
    categoria: "Nicaragua",
    pais: "Nicaragua",
  },
];

/** Deportes curados */
export const CURATED_SPORTS_CHANNELS: CuratedLiveChannel[] = [
  {
    id: "dep-mlb",
    nombre: "MLB Strike Zone",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_MLB_STRIKE_ZONE/index.m3u8",
    ),
    categoria: "Deportes",
    pais: "EE.UU.",
  },
  {
    id: "dep-fox",
    nombre: "Fox Deportes",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_FOX_DEPORTES/index.m3u8",
    ),
    categoria: "Deportes",
    pais: "EE.UU.",
  },
  {
    id: "dep-fs1",
    nombre: "Fox Sports 1",
    streamUrl: normalizeStreamUrl(
      "http://cdn.haititivi.com/Fox_Sports_1/index.m3u8",
    ),
    categoria: "Deportes",
    pais: "EE.UU.",
  },
  {
    id: "dep-dsports",
    nombre: "DSports",
    streamUrl: normalizeStreamUrl(
      "https://streamvidex.qzz.io/videx/dsportsar/index.m3u8",
    ),
    categoria: "Deportes",
    pais: "Latinoamérica",
  },
  {
    id: "dep-bein",
    nombre: "beIN Sports USA",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_beIN_SPORTS/index.m3u8",
    ),
    categoria: "Deportes",
    pais: "EE.UU.",
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
  if (/canal 55|telemorisco/.test(n)) return "Canal 55 · Telemorisco TV";
  if (/tele antillas|coral 39|telesistema/.test(n)) return "Grupo Corripio";
  if (/rcn|caracol|city tv|canal 1|win sports/.test(n)) return "Colombia";
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
