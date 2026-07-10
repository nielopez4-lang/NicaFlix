const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type YoutubePlayability = {
  ok: boolean;
  status?: string;
  reason?: string;
  embeddable?: boolean;
};

function extractYtPlayerResponse(html: string): Record<string, unknown> | null {
  const marker = "ytInitialPlayerResponse = ";
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  if (html[i] !== "{") return null;

  let depth = 0;
  for (let j = i; j < html.length; j++) {
    if (html[j] === "{") depth++;
    else if (html[j] === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1)) as Record<string, unknown>;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Verifica oEmbed (rápido) — video existe y permite embed básico. */
export async function isYoutubeOembedOk(videoId: string): Promise<boolean> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return false;
  try {
    const watch = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`,
      {
        next: { revalidate: 86400 },
        headers: { "User-Agent": UA },
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Verifica reproducción real: status OK + embed permitido.
 * Descarta videos borrados, privados, geo-bloqueados y embed deshabilitado.
 */
export async function checkYoutubePlayability(
  videoId: string,
): Promise<YoutubePlayability> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return { ok: false, reason: "invalid-id" };
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      next: { revalidate: 86400 },
      headers: {
        "User-Agent": UA,
        "Accept-Language": "es",
      },
    });

    if (!res.ok) {
      return { ok: false, status: "HTTP_ERROR", reason: String(res.status) };
    }

    const html = await res.text();
    const player = extractYtPlayerResponse(html);
    if (!player) {
      const oembed = await isYoutubeOembedOk(videoId);
      return oembed
        ? { ok: true, status: "OEMBED_ONLY" }
        : { ok: false, reason: "no-player-data" };
    }

    const playability = player.playabilityStatus as
      | {
          status?: string;
          reason?: string;
          playableInEmbed?: boolean;
        }
      | undefined;

    const status = playability?.status ?? "UNKNOWN";
    const embeddable = playability?.playableInEmbed !== false;
    const ok = status === "OK" && embeddable;

    return {
      ok,
      status,
      reason: playability?.reason,
      embeddable,
    };
  } catch {
    return { ok: false, reason: "fetch-error" };
  }
}

/** Alias usado por el catálogo. */
export async function isYoutubeEmbeddable(videoId: string): Promise<boolean> {
  return (await checkYoutubePlayability(videoId)).ok;
}

/** Filtra IDs reproducibles en lotes. */
export async function filterPlayableIds(
  ids: string[],
  concurrency = 5,
): Promise<Set<string>> {
  const unique = [...new Set(ids)];
  const ok = new Set<string>();

  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (id) => {
        const check = await checkYoutubePlayability(id);
        return check.ok ? id : null;
      }),
    );
    for (const id of results) {
      if (id) ok.add(id);
    }
  }

  return ok;
}

/** @deprecated use filterPlayableIds */
export async function filterEmbeddableIds(
  ids: string[],
  concurrency = 5,
): Promise<Set<string>> {
  return filterPlayableIds(ids, concurrency);
}
