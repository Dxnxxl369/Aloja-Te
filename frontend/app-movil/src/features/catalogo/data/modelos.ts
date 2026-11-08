// ======================================================================
// ARCHIVO: catalogo/data/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los DTO que devuelve MS-01 para el catálogo (solo los campos que se usan).
// PARA QUÉ SIRVE: Que solo esta carpeta conozca los nombres del backend.
// SIN ÉL: Los nombres de Java se filtrarían a la pantalla.
// NO VA AQUÍ: Modelos de dominio.
// ======================================================================
// Fuente MS-01: AlojamientoDto.java, UnidadReservableDto.java, TipoPropiedadDto.java.

export interface UnidadDto {
  idUnidad: string;
  capacidadHuespedes: number;
  precioNoche: number;
  estado: string; // DISPONIBLE | MANTENIMIENTO | INACTIVO
}

export interface AlojamientoDto {
  idAlojamiento: string;
  idAnfitrion: string;
  idTipoPropiedad?: number | null;
  tipoPropiedadNombre?: string | null;
  titulo: string;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad: string;
  departamento?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  politicas?: string | null;
  horarioEntrada?: string | null;
  horarioSalida?: string | null;
  servicios?: { nombre: string }[];
  fotografias?: { url: string; orden?: number }[];
  unidades?: UnidadDto[];
}

/** GET /alojamientos/{id}/valoraciones/resumen */
export interface ResumenValoracionesDto {
  calificacionPromedio: number | null;
  totalResenas: number;
}

export interface TipoPropiedadDto {
  idTipoPropiedad: number;
  nombre: string;
}
