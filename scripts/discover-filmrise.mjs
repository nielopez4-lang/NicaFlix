const handles = [
  "FilmRiseMovies",
  "FilmRiseFreeMovies",
  "FilmRiseHorror",
  "FilmRiseAction",
  "FilmRiseEspanol",
  "FilmRisePeliculas",
  "FilmRiseMoviesEspanol",
  "FilmRiseSciFi",
  "FilmRiseWestern",
];

async function getChannelId(handle) {
  const url = `https://www.youtube.com/@${handle}`;
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });
  const html = await r.text();
  const m1 = html.match(/"channelId":"(UC[^"]+)"/);
  const m2 = html.match(/"externalId":"(UC[^"]+)"/);
  const id = m1?.[1] ?? m2?.[1] ?? null;
  console.log(handle, r.status, id);
  if (id) {
    const rss = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
    );
    const xml = await rss.text();
    const entries = (xml.match(/<entry>/g) ?? []).length;
    console.log("  RSS entries:", entries, rss.status);
  }
}

for (const h of handles) {
  await getChannelId(h);
}
