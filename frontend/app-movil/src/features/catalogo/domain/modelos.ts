// ======================================================================
// ARCHIVO: catalogo/domain/modelos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Qué es un alojamiento del catálogo para la app, los tipos de propiedad y los filtros.
// PARA QUÉ SIRVE: Un solo vocabulario para el explorador, sin depender de cómo lo llame MS-01.
// SIN ÉL: Las pantallas usarían el JSON crudo de MS-01.
// NO VA AQUÍ: Funciones ni red. Los DTO viven en data/modelos.ts.
// ======================================================================

/** Un alojamiento publicado, listo para mostrarse en una tarjeta. */
export interface AlojamientoCatalogo {
  id: string;
  anfitrionId: string;
  titulo: string;
  tipoId?: number;
  tipo?: string;
  ciudad: string;
  departamento?: string;
  descripcion?: string;
  fotoUrl?: string;
  /** Promedio de reseñas (0-5); null si no tiene reseñas. */
  calificacion: number | null;
  totalResenas: number;
  /** El precio por noche más bajo entre sus unidades disponibles; null si no hay ninguna. */
  precioDesde: number | null;
  capacidadMax: number | null;
}

/** Todo lo que se muestra en la ficha de un alojamiento. Los campos opcionales son los que MS-01 puede no enviar. */
export interface DetalleAlojamiento {
  id: string;
  titulo: string;
  tipo?: string;
  ciudad: string;
  departamento?: string;
  direccion?: string;
  descripcion?: string;
  politicas?: string;
  /** "HH:mm" */
  horarioEntrada?: string;
  /** "HH:mm" */
  horarioSalida?: string;
  latitud?: number;
  longitud?: number;
  /** URLs de las fotos, en el orden que indica MS-01. */
  fotos: string[];
  servicios: string[];
  calificacion: number | null;
  totalResenas: number;
  precioDesde: number | null;
  capacidadMax: number | null;
}

export interface TipoPropiedad {
  id: number;
  nombre: string;
}

/** Filtros que MS-01 aplica sobre las unidades (por eso se piden de nuevo al cambiarlos). */
export interface FiltrosServidor {
  /** Bolivianos por noche. */
  precioMax?: number;
  /** Mínimo de huéspedes que debe aguantar la unidad. */
  huespedes?: number;
}

/** Filtros que se aplican en el celular sobre lo que ya se cargó. */
export interface FiltrosLocales {
  texto: string;
  ciudad: string | null;
  tipoId: number | null;
}

export interface ResultadoLista {
  alojamientos: AlojamientoCatalogo[];
  /** true si no hubo red y se muestra lo último guardado. */
  desdeCache: boolean;
}
