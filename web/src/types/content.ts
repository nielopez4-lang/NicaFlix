export type Categoria =
  | "accion"
  | "comedia"
  | "familia"
  | "terror"
  | "peliculas"
  | "series"
  | "anime"
  | "kids";

export type ContentItem = {
  id: string;
  titulo: string;
  sinopsis: string;
  portada: string;
  categoria: Categoria;
  streamUrl?: string;
  youtubeId?: string;
  fuente?: "filmrise" | "horror-central" | "archive" | "jikan";
  idioma?: "es" | "multi" | "en";
  anio?: string;
};

export type LiveChannel = {
  id: string;
  nombre: string;
  /** Cadena o marca: Televisa, Canal 8, TV Azteca, etc. */
  red?: string;
  logo: string;
  streamUrl: string;
  categoria: string;
  pais: string;
};

export type SportEvent = {
  id: string;
  titulo: string;
  hora: string;
  enVivo: boolean;
  streamUrl?: string;
  canalId?: string;
};

export type CatalogResponse = {
  catalogo: ContentItem[];
  stats: Record<string, number>;
};

export type LiveResponse = {
  lives: LiveChannel[];
  deportesCanales: LiveChannel[];
  eventosDeportes: SportEvent[];
};

export type LiveScore = {
  id: string;
  sport: "mlb" | "soccer";
  league: string;
  awayTeam: string;
  homeTeam: string;
  awayAbbr: string;
  homeAbbr: string;
  awayScore: number | null;
  homeScore: number | null;
  status: string;
  isLive: boolean;
  period?: string;
  startTime?: string;
  awayLogo?: string;
  homeLogo?: string;
};

export type StandingsRow = {
  rank: number;
  team: string;
  league: string;
  division?: string;
  wins?: number;
  losses?: number;
  pct?: string;
  gb?: string;
  points?: number;
  played?: number;
  goalDiff?: number;
};

export type SportsResponse = {
  liveScores: LiveScore[];
  upcoming: LiveScore[];
  mlbStandings: StandingsRow[];
  soccerStandings: StandingsRow[];
  updatedAt: string;
};
