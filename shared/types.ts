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
  fuente?: "filmrise" | "horror-central" | "archive" | "jikan" | "spanish-cinema";
  idioma?: "es" | "multi" | "en";
  anio?: string;
};

export type CatalogResponse = {
  catalogo: ContentItem[];
  stats: Record<string, number>;
};
