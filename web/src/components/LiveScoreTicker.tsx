"use client";

import type { LiveScore } from "@/types/content";
import { useEffect, useState } from "react";

function ScoreCard({ game }: { game: LiveScore }) {
  const away = game.awayScore ?? 0;
  const home = game.homeScore ?? 0;

  return (
    <div
      className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2 ${
        game.isLive ? "bg-brand-red/20 border border-brand-red/40" : "bg-white/10"
      }`}
    >
      {game.isLive && (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-red">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-red" />
          En vivo
        </span>
      )}
      <div className="min-w-[140px]">
        <p className="text-[10px] uppercase text-brand-muted">{game.league}</p>
        <div className="flex items-center justify-between gap-4 text-sm font-semibold">
          <span className={away > home ? "text-white" : "text-brand-muted"}>
            {game.awayAbbr} {game.awayScore ?? "-"}
          </span>
          <span className="text-xs text-brand-muted">@</span>
          <span className={home > away ? "text-white" : "text-brand-muted"}>
            {game.homeAbbr} {game.homeScore ?? "-"}
          </span>
        </div>
        {game.period && (
          <p className="text-[10px] text-brand-muted">{game.period}</p>
        )}
      </div>
    </div>
  );
}

export function LiveScoreTicker({ initialLive = [] }: { initialLive?: LiveScore[] }) {
  const [live, setLive] = useState<LiveScore[]>(initialLive);

  useEffect(() => {
    setLive(initialLive);
  }, [initialLive]);

  useEffect(() => {
    const refresh = () => {
      fetch("/api/sports")
        .then((r) => r.json())
        .then((d) => setLive(d.liveScores ?? []))
        .catch(() => {});
    };
    refresh();
    const id = setInterval(refresh, 45000);
    return () => clearInterval(id);
  }, []);

  if (!live.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-red/30 bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-2 py-2">
        <span className="hidden shrink-0 px-2 text-xs font-bold uppercase tracking-wider text-brand-red sm:block">
          En vivo
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {live.map((game) => (
            <ScoreCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LiveScoreGrid({
  live,
  upcoming,
}: {
  live: LiveScore[];
  upcoming: LiveScore[];
}) {
  const show = live.length ? live : upcoming.slice(0, 8);
  if (!show.length) {
    return (
      <p className="glass rounded-xl p-6 text-center text-brand-muted">
        No hay partidos programados para hoy
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {show.map((game) => (
        <div
          key={game.id}
          className={`rounded-xl border p-4 ${
            game.isLive
              ? "border-brand-red/50 bg-brand-red/10"
              : "glass border-white/10"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-brand-muted">{game.league}</span>
            {game.isLive ? (
              <span className="flex items-center gap-1 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                EN VIVO
              </span>
            ) : (
              <span className="text-[10px] text-brand-muted">{game.period}</span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{game.awayTeam}</span>
              <span className="text-xl font-bold tabular-nums">
                {game.awayScore ?? "–"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{game.homeTeam}</span>
              <span className="text-xl font-bold tabular-nums">
                {game.homeScore ?? "–"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
