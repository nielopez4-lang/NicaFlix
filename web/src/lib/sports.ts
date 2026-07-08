import type { LiveScore, SportsResponse, StandingsRow } from "@/types/content";

const MLB_API = "https://statsapi.mlb.com/api/v1";
const SPORTSDB = "https://www.thesportsdb.com/api/v1/json/3";

const SOCCER_LEAGUES = [
  { id: 4328, name: "Premier League" },
  { id: 4335, name: "La Liga" },
  { id: 4350, name: "Liga MX" },
  { id: 4346, name: "MLS" },
  { id: 4480, name: "Champions League" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function soccerIsLive(status: string): boolean {
  return ["1H", "2H", "HT", "LIVE", "In Progress", "2nd Half", "1st Half"].includes(
    status,
  );
}

function soccerPeriod(status: string, time?: string): string {
  if (status === "HT") return "Medio tiempo";
  if (status === "1H") return "1er tiempo";
  if (status === "2H") return "2do tiempo";
  if (time) return time.slice(0, 5);
  return status;
}

async function fetchMlbGames(date: string): Promise<LiveScore[]> {
  const res = await fetch(
    `${MLB_API}/schedule?hydrate=linescore,team&sportId=1&date=${date}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  const games = data.dates?.[0]?.games ?? [];

  return games.map((g: {
    gamePk: number;
    status: { abstractGameState: string; detailedState: string };
    teams: {
      away: { team: { name: string; abbreviation: string } };
      home: { team: { name: string; abbreviation: string } };
    };
    linescore?: {
      teams: { away: { runs: number }; home: { runs: number } };
      currentInningOrdinal?: string;
      inningState?: string;
    };
    gameDate: string;
  }) => {
    const isLive = g.status.abstractGameState === "Live";
    const isFinal = g.status.abstractGameState === "Final";
    const awayScore = g.linescore?.teams?.away?.runs ?? null;
    const homeScore = g.linescore?.teams?.home?.runs ?? null;
    let period: string | undefined;
    if (isLive && g.linescore) {
      period = `${g.linescore.inningState ?? ""} ${g.linescore.currentInningOrdinal ?? ""}`.trim();
    } else if (isFinal) {
      period = "Final";
    } else {
      period = new Date(g.gameDate).toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return {
      id: `mlb-${g.gamePk}`,
      sport: "mlb" as const,
      league: "MLB",
      awayTeam: g.teams.away.team.name,
      homeTeam: g.teams.home.team.name,
      awayAbbr: g.teams.away.team.abbreviation,
      homeAbbr: g.teams.home.team.abbreviation,
      awayScore,
      homeScore,
      status: g.status.detailedState,
      isLive,
      period,
      startTime: g.gameDate,
    };
  });
}

async function fetchSoccerGames(date: string): Promise<LiveScore[]> {
  const res = await fetch(`${SPORTSDB}/eventsday.php?d=${date}&s=Soccer`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const events = data.events ?? [];

  return events.map((e: {
    idEvent: string;
    strLeague: string;
    strAwayTeam: string;
    strHomeTeam: string;
    intAwayScore: string | null;
    intHomeScore: string | null;
    strStatus: string;
    strTime: string;
    strAwayTeamBadge?: string;
    strHomeTeamBadge?: string;
  }) => {
    const isLive = soccerIsLive(e.strStatus);
    const awayScore =
      e.intAwayScore !== null && e.intAwayScore !== ""
        ? Number(e.intAwayScore)
        : null;
    const homeScore =
      e.intHomeScore !== null && e.intHomeScore !== ""
        ? Number(e.intHomeScore)
        : null;

    return {
      id: `soccer-${e.idEvent}`,
      sport: "soccer" as const,
      league: e.strLeague,
      awayTeam: e.strAwayTeam,
      homeTeam: e.strHomeTeam,
      awayAbbr: e.strAwayTeam.slice(0, 3).toUpperCase(),
      homeAbbr: e.strHomeTeam.slice(0, 3).toUpperCase(),
      awayScore,
      homeScore,
      status: e.strStatus,
      isLive,
      period: soccerPeriod(e.strStatus, e.strTime),
      awayLogo: e.strAwayTeamBadge,
      homeLogo: e.strHomeTeamBadge,
    };
  });
}

async function fetchMlbStandings(): Promise<StandingsRow[]> {
  const year = new Date().getFullYear();
  const res = await fetch(
    `${MLB_API}/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&hydrate=division,team`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  const rows: StandingsRow[] = [];

  for (const record of data.records ?? []) {
    const division = record.division?.name ?? record.league?.name ?? "MLB";
    for (const t of record.teamRecords ?? []) {
      rows.push({
        rank: t.divisionRank ?? t.leagueRank ?? rows.length + 1,
        team: t.team.name,
        league: "MLB",
        division,
        wins: t.wins,
        losses: t.losses,
        pct: t.winningPercentage,
        gb: t.gamesBack === "0" ? "—" : t.gamesBack,
      });
    }
  }

  return rows.sort((a, b) => {
    if (a.division !== b.division) return (a.division ?? "").localeCompare(b.division ?? "");
    return a.rank - b.rank;
  });
}

async function fetchSoccerStandings(): Promise<StandingsRow[]> {
  const rows: StandingsRow[] = [];
  const season = "2025-2026";

  await Promise.all(
    SOCCER_LEAGUES.map(async ({ id, name }) => {
      try {
        const res = await fetch(`${SPORTSDB}/lookuptable.php?l=${id}&s=${season}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return;
        const data = await res.json();
        for (const r of data.table ?? []) {
          rows.push({
            rank: Number(r.intRank),
            team: r.strTeam,
            league: name,
            points: Number(r.intPoints),
            played: Number(r.intPlayed),
            goalDiff: Number(r.intGoalDifference),
            wins: Number(r.intWin),
            losses: Number(r.intLoss),
          });
        }
      } catch {
        /* skip league */
      }
    }),
  );

  return rows.sort((a, b) =>
    a.league === b.league ? a.rank - b.rank : a.league.localeCompare(b.league),
  );
}

export async function fetchSportsData(): Promise<SportsResponse> {
  const date = todayIso();
  const [mlbGames, soccerGames, mlbStandings, soccerStandings] = await Promise.all([
    fetchMlbGames(date),
    fetchSoccerGames(date),
    fetchMlbStandings(),
    fetchSoccerStandings(),
  ]);

  const allGames = [...mlbGames, ...soccerGames];
  const liveScores = allGames.filter((g) => g.isLive);
  const upcoming = allGames.filter((g) => !g.isLive && g.status !== "Final");

  return {
    liveScores,
    upcoming: upcoming.slice(0, 20),
    mlbStandings,
    soccerStandings,
    updatedAt: new Date().toISOString(),
  };
}
