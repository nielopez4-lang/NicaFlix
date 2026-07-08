async function searchVideos(query, max = 30) {
  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(query) +
    "&sp=EgIQAg%253D%253D"; // videos filter sometimes; try without
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });
  const html = await r.text();
  const ids = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(
    (m) => m[1],
  );
  const titles = [
    ...html.matchAll(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g),
  ].map((m) => m[1]);
  const unique = [];
  const seen = new Set();
  for (let i = 0; i < ids.length && unique.length < max; i++) {
    if (seen.has(ids[i])) continue;
    seen.add(ids[i]);
    unique.push({ id: ids[i], title: titles[i] ?? ids[i] });
  }
  console.log(`Query: ${query} -> ${unique.length} videos`);
  return unique;
}

const queries = [
  "FilmRise película completa español",
  "FilmRise full movie español latino",
  "FilmRise Movies pelicula completa",
  "FilmRise terror película completa",
  "FilmRise comedia película completa",
  "FilmRise acción película completa",
  "FilmRise familia película completa",
  "FilmRise Movies 2024 full movie",
  "FilmRise Movies 2025 full movie",
  "FilmRise Movies 2023 full movie",
];

const all = new Map();
for (const q of queries) {
  for (const v of await searchVideos(q, 25)) {
    if (!all.has(v.id)) all.set(v.id, { ...v, query: q });
  }
}

console.log("\nTotal unique from search:", all.size);
for (const v of [...all.values()].slice(0, 20)) {
  console.log("-", v.title);
}

// channel search
async function searchChannels(query) {
  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(query) +
    "&sp=EgIQAg%253D%253D";
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await r.text();
  const channels = [
    ...html.matchAll(
      /"channelId":"(UC[^"]+)".*?"title":\{"simpleText":"([^"]+)"/g,
    ),
  ];
  console.log(`\nChannels for "${query}":`);
  const seen = new Set();
  for (const m of channels) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    console.log(m[2], m[1]);
  }
}

await searchChannels("FilmRise Español");
await searchChannels("FilmRise películas español");
