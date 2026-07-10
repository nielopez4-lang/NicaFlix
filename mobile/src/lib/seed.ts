import { normalizeStreamUrl } from "@/lib/stream-playback";

/** Canales — respaldo offline (misma normalización HTTPS/proxy que la web). */
export const canalesNicaragua = [
  {
    id: "co-55",
    nombre: "Canal 55 Telemorisco",
    red: "Canal 55 · Telemorisco TV",
    streamUrl: normalizeStreamUrl(
      "https://canal.mediaserver.com.co/live/telemorisco.m3u8",
    ),
    pais: "Colombia",
    categoria: "Entretenimiento",
  },
  {
    id: "do-teleantillas10",
    nombre: "Tele Antillas Canal 10",
    red: "Grupo Corripio",
    streamUrl: normalizeStreamUrl(
      "http://45.171.108.253:8888/TELEANTILLAS/index.m3u8",
    ),
    pais: "Rep. Dominicana",
    categoria: "República Dominicana",
  },
  {
    id: "do-coral39",
    nombre: "Coral Canal 39",
    red: "Grupo Corripio",
    streamUrl: normalizeStreamUrl(
      "http://190.110.36.254:80/CORAL39/index.m3u8",
    ),
    pais: "Rep. Dominicana",
    categoria: "República Dominicana",
  },
  {
    id: "mx-chavo",
    nombre: "El Chavo del 8",
    red: "El Chavo TV",
    streamUrl: normalizeStreamUrl(
      "https://live20.bozztv.com/giatvplayout7/giatv-211465/playlist.m3u8",
    ),
    pais: "México",
    categoria: "Clásicos",
  },
  {
    id: "mx-comedia",
    nombre: "Distrito Comedia",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://177.234.249.135:8888/DistritoComedia/index.m3u8",
    ),
    pais: "México",
    categoria: "Clásicos",
  },
  {
    id: "mx-estrellas",
    nombre: "Las Estrellas",
    red: "Televisa",
    streamUrl: normalizeStreamUrl(
      "http://177.234.249.135:8888/LasEstrellas/index.m3u8",
    ),
    pais: "México",
    categoria: "Entretenimiento",
  },
  {
    id: "ni-tn8",
    nombre: "TN8",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://streamingcws30.com/tn8/videotn8/chunks.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-canal4",
    nombre: "Canal 4",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/x7rwv8c?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-canal6",
    nombre: "Canal 6 Nicaragüense",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/xaka1oy?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-canal10",
    nombre: "Canal 10",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://d82p4jax9pjrm.cloudfront.net/ts:abr.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-canal15",
    nombre: "Canal 15",
    red: "Nicaragua",
    streamUrl:
      "https://www.dailymotion.com/embed/video/xaka1oy?autoplay=1&ui-start-screen-info=0&queue-enable=0",
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-cvision",
    nombre: "Canal Cvisión",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://stream.cvision.live/cvision_stream.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-cdnn23",
    nombre: "CDNN 23",
    red: "Nicaragua",
    streamUrl: "https://cdnn23live.com/",
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-boaco7",
    nombre: "Canal 7 Boaco",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl("https://cdn.amixtv.com/c7boaco/index.m3u8"),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-cootel9",
    nombre: "CooTel Nicaragua",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "http://138.117.4.70:8075/channel9/playlist.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-olam",
    nombre: "Olam Metro TV",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://netzerstreaming.com:4433/hls/olammetro/index.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-viva13",
    nombre: "Viva Nicaragua Canal 13",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl("http://45.171.108.253:8888/VIVA/index.m3u8"),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
  {
    id: "ni-wtv20",
    nombre: "WTV Canal 20",
    red: "Nicaragua",
    streamUrl: normalizeStreamUrl(
      "https://cloudvideo.servers10.com:8081/8130/index.m3u8",
    ),
    pais: "Nicaragua",
    categoria: "Nicaragua",
  },
];

export const deportesSeed = [
  {
    id: "dep-mlb",
    nombre: "MLB Strike Zone",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_MLB_STRIKE_ZONE/index.m3u8",
    ),
    pais: "EE.UU.",
  },
  {
    id: "dep-fox",
    nombre: "Fox Deportes",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_FOX_DEPORTES/index.m3u8",
    ),
    pais: "EE.UU.",
  },
  {
    id: "dep-fs1",
    nombre: "Fox Sports 1",
    streamUrl: normalizeStreamUrl(
      "http://cdn.haititivi.com/Fox_Sports_1/index.m3u8",
    ),
    pais: "EE.UU.",
  },
  {
    id: "dep-dsports",
    nombre: "DSports",
    streamUrl: normalizeStreamUrl(
      "https://streamvidex.qzz.io/videx/dsportsar/index.m3u8",
    ),
    pais: "Latinoamérica",
  },
  {
    id: "dep-bein",
    nombre: "beIN Sports USA",
    streamUrl: normalizeStreamUrl(
      "http://23.237.104.106:8080/USA_beIN_SPORTS/index.m3u8",
    ),
    pais: "EE.UU.",
  },
];
