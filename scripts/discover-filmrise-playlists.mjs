const CHANNEL = "UCU4BHh9Dwfd7-I_xTZ5037Q";
const PLAYLISTS = [
  "PLYCGB2FR2jUqY6lR-Iz4cFAyf2M-HyihM",
  "PLYCGB2FR2jUoTPLYDjh-f3C7G37PYXUcI",
  "PLYCGB2FR2jUoQJ5A6qqxsoqUYQ8jaz96E",
  "PLYCGB2FR2jUptGuh7VJGqj0cXsHRm29As",
  "PLYCGB2FR2jUpZewMIgBI48xhvhosT1O4t",
  "PLYCGB2FR2jUqtU0BO8tkJ82X5XcB8yfcH",
  "PLYCGB2FR2jUrTT1GzkzSvW3YZOLxY0lC-",
];

async function fetchText(url) {
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  return await r.text();
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssVideos(xml) {
  const entries = xml.split("<entry>").slice(1);
  return entries.map((block) => {
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = decode(block.match(/<title>([^<]+)<\/title>/)?.[1] ?? "");
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];
    const desc = decode(
      block.match(/<media:description>([^<]*)<\/media:description>/)?.[1] ??
        "",
    );
    return { id, title, published, desc };
  });
}

function isSpanish(v) {
  const t = `${v.title} ${v.desc}`.toLowerCase();
  if (/español|espanol|latino|castellano|doblado al español|subtitulado en español| en es\b|pel[ií]cula completa en español/i.test(t))
    return true;
  if (/pel[ií]cula completa|full movie|full film/i.test(t) && /español|espanol|latino/i.test(t))
    return true;
  return false;
}

function isFullMovie(v) {
  return /full movie|full film|pel[ií]cula completa|pelicula completa/i.test(
    `${v.title} ${v.desc}`,
  );
}

function classifyGenre(title, desc, playlistHint = "") {
  const t = `${title} ${desc} ${playlistHint}`.toLowerCase();
  if (/horror|terror|scary|zombie|vampire|ghost|haunt|slasher|miedo|demon|witch|nightmare|evil dead|friday the 13|halloween|exorcist|crypt|killer|murder|serial killer|evil killer|crime scene|forensic|true crime|documentary.*kill|scam|sextortion/i.test(t))
    return "terror";
  if (/comedy|comedia|funny|laugh|stand.?up|humor|risa|hilar|peep show|doc martin|cool dog|party girl|sheryl underwood/i.test(t))
    return "comedia";
  if (/family|familia|kids|child|infantil|dinotopia|dog|adventure|disney|teen|coming of age|lymelife|white coats|school|young/i.test(t))
    return "familia";
  if (/action|acción|accion|war|guerra|fight|martial|hero|statham|van damme|cage|thriller|survivor|blitz|code|agent|gun|battle|combat|military|soldier|cop|police|heist|revenge|assassin|spy|007|bond/i.test(t))
    return "accion";
  return "accion";
}

const handles = [
  "FilmRiseMovies",
  "FilmRiseHorror",
  "FilmRiseFreeMovies",
  "FilmRiseChannel",
  "FilmRiseTelevision",
  "FilmRiseEspanol",
  "FilmRiseEnEspanol",
  "FilmRisePeliculas",
  "FilmRiseMoviesYT",
  "filmrise",
];

async function getChannelId(handle) {
  const r = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (r.status !== 200) return null;
  const html = await r.text();
  return html.match(/"channelId":"(UC[^"]+)"/)?.[1] ?? null;
}

const extraChannels = [];
for (const h of handles) {
  const id = await getChannelId(h);
  if (id && id !== CHANNEL) extraChannels.push({ handle: h, id });
  console.log(h, id ?? "not found");
}

const allVideos = new Map();

async function addFromRss(url, playlistHint = "") {
  const xml = await fetchText(url);
  for (const v of parseRssVideos(xml)) {
    if (!v.id || !isFullMovie(v)) continue;
    const existing = allVideos.get(v.id);
    const genero = classifyGenre(v.title, v.desc, playlistHint);
    if (!existing) {
      allVideos.set(v.id, { ...v, genero, espanol: isSpanish(v), fuente: "filmrise" });
    } else if (existing.genero === "accion" && genero !== "accion") {
      existing.genero = genero;
    }
  }
}

await addFromRss(
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`,
);
for (const pl of PLAYLISTS) {
  await addFromRss(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${pl}`,
    pl,
  );
}

for (const ch of extraChannels) {
  await addFromRss(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`,
    ch.handle,
  );
}

const items = [...allVideos.values()].sort(
  (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
);

const stats = { total: items.length, espanol: 0, accion: 0, comedia: 0, familia: 0, terror: 0 };
for (const v of items) {
  if (v.espanol) stats.espanol++;
  stats[v.genero]++;
}

console.log("\nStats:", stats);
console.log("\nRecent Spanish full movies:");
for (const v of items.filter((x) => x.espanol).slice(0, 15)) {
  console.log(`[${v.genero}] ${v.title} (${v.published?.slice(0, 10)})`);
}

console.log("\nRecent all full movies by genre sample:");
for (const g of ["accion", "comedia", "familia", "terror"]) {
  console.log(`\n== ${g} ==`);
  for (const v of items.filter((x) => x.genero === g).slice(0, 5)) {
    console.log(v.title);
  }
}
