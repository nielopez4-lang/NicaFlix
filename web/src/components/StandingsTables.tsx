import type { StandingsRow } from "@/types/content";

function StandingsTable({
  rows,
  sport,
}: {
  rows: StandingsRow[];
  sport: "mlb" | "soccer";
}) {
  if (!rows.length) {
    return (
      <p className="text-sm text-brand-muted">Tabla no disponible en este momento</p>
    );
  }

  const leagues = [...new Set(rows.map((r) => r.league))];

  return (
    <div className="space-y-8">
      {leagues.map((league) => {
        const leagueRows = rows.filter((r) => r.league === league);
        const divisions = sport === "mlb"
          ? [...new Set(leagueRows.map((r) => r.division).filter(Boolean))]
          : [league];

        return divisions.map((div) => {
          const divRows = sport === "mlb"
            ? leagueRows.filter((r) => r.division === div)
            : leagueRows;

          return (
            <div key={`${league}-${div}`}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
                {div}
              </h3>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-left text-xs text-brand-muted">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Equipo</th>
                      {sport === "mlb" ? (
                        <>
                          <th className="px-3 py-2">G</th>
                          <th className="px-3 py-2">P</th>
                          <th className="px-3 py-2">Pct</th>
                          <th className="px-3 py-2">Dif</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-2">PJ</th>
                          <th className="px-3 py-2">Pts</th>
                          <th className="px-3 py-2">DG</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {divRows.map((row) => (
                      <tr
                        key={`${row.league}-${row.team}`}
                        className="border-t border-white/5 hover:bg-white/5"
                      >
                        <td className="px-3 py-2 font-bold text-brand-muted">
                          {row.rank}
                        </td>
                        <td className="px-3 py-2 font-medium">{row.team}</td>
                        {sport === "mlb" ? (
                          <>
                            <td className="px-3 py-2 tabular-nums">{row.wins}</td>
                            <td className="px-3 py-2 tabular-nums">{row.losses}</td>
                            <td className="px-3 py-2 tabular-nums">{row.pct}</td>
                            <td className="px-3 py-2 tabular-nums">{row.gb}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 tabular-nums">{row.played}</td>
                            <td className="px-3 py-2 tabular-nums font-semibold">
                              {row.points}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {row.goalDiff !== undefined && row.goalDiff > 0
                                ? `+${row.goalDiff}`
                                : row.goalDiff}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}

export function MlbStandingsPanel({ rows }: { rows: StandingsRow[] }) {
  return <StandingsTable rows={rows} sport="mlb" />;
}

export function SoccerStandingsPanel({ rows }: { rows: StandingsRow[] }) {
  return <StandingsTable rows={rows} sport="soccer" />;
}
