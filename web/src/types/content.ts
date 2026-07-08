export type Categoria = "peliculas" | "series" | "anime" | "kids";

export type ContentItem = {
  id: string;
  titulo: string;
  sinopsis: string;
  portada: string;
  categoria: Categoria;
  streamUrl?: string;
  youtubeId?: string;
};

export type LiveChannel = {
  id: string;
  nombre: string;
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
