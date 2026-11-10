// ======================================================================
// ARCHIVO: catalogo/domain/interfaces.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Dos contratos: RepositorioCatalogo (de dónde salen los alojamientos) y CasosCatalogo (lo que la app puede hacer con ellos).
// PARA QUÉ SIRVE: Los casos no saben de HTTP ni SQLite; la pantalla usa CasosCatalogo sin conocer el repositorio.
// SIN ÉL: Los casos quedarían atados a la red y no se podrían probar solos.
// NO VA AQUÍ: Implementaciones (data/repositorio.ts y domain/casos.ts).
// ======================================================================

import type {
  AlojamientoCatalogo,
  DetalleAlojamiento,
  FiltrosLocales,
  FiltrosServidor,
  ResenaAlojamiento,
  ResultadoLista,
  TipoPropiedad,
} from './modelos';

export interface RepositorioCatalogo {
  /** Alojamientos publicados. Sin red devuelve lo último guardado (`desdeCache`). */
  listar(filtros: FiltrosServidor): Promise<ResultadoLista>;
  tipos(): Promise<TipoPropiedad[]>;
  /** La ficha completa. Sin red devuelve lo último guardado de ese alojamiento; si no hay, lanza el error. */
  detalle(id: string): Promise<DetalleAlojamiento>;
  obtenerValoraciones?(id: string): Promise<ResenaAlojamiento[]>;
}

export interface CasosCatalogo {
  listarAlojamientos(filtros: FiltrosServidor): Promise<ResultadoLista>;
  listarTipos(): Promise<TipoPropiedad[]>;
  obtenerDetalle(id: string): Promise<DetalleAlojamiento>;
  obtenerValoraciones?(id: string): Promise<ResenaAlojamiento[]>;
  /** Los mejor calificados. Solo cuentan los que tienen reseñas: sin reseñas no hay "destacados". */
  destacados(lista: AlojamientoCatalogo[]): AlojamientoCatalogo[];
  /** Ciudades que aparecen en la lista, de la que más alojamientos tiene a la que menos. */
  ciudades(lista: AlojamientoCatalogo[]): string[];
  /** Aplica el texto de búsqueda, la ciudad y el tipo. Ignora mayúsculas y tildes. */
  filtrar(lista: AlojamientoCatalogo[], filtros: FiltrosLocales): AlojamientoCatalogo[];
}
