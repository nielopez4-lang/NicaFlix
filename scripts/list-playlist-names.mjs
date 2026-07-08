const channels = [
  { name: "FilmRiseMovies", handle: "FilmRiseMovies" },
  { name: "FilmRiseTelevision", handle: "FilmRiseTelevision" },
];

async function inspect(handle) {
  const r = await fetch(`https://www.youtube.com/@${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await r.text();
  const channelId = html.match(/"channelId":"(UC[^"]+)"/)?.[1];
  const playlistBlocks = [
    ...html.matchAll(
      /"playlistId":"(PL[^"]+)".*?"title":\{"simpleText":"([^"]+)"\}/g,
    ),
  ];
  console.log("\n===", handle, channelId, "===");
  const seen = new Set();
  for (const m of playlistBlocks) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    console.log(m[2], "->", m[1]);
  }
  console.log("Total playlists:", seen.size);
}

for (const c of channels) await inspect(c.handle);
