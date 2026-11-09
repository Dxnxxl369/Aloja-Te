// ======================================================================
// ARCHIVO: agente/data/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los DTO que usa el agente: alojamientos de MS-01 y el pedido de un turno del agente a MS-04.
// PARA QUÉ SIRVE: Que solo esta carpeta conozca los nombres de los backends.
// SIN ÉL: Los nombres de Java/Python se filtrarían al plan del agente.
// NO VA AQUÍ: Modelos de dominio.
// ======================================================================
// Fuente MS-01: AlojamientoDto.java y UnidadReservableDto.java (se listan solo los campos usados).

export interface UnidadDto {
  idUnidad: string;
  idAlojamiento: string;
  nombre: string;
  capacidadHuespedes: number;
  precioNoche: number;
  estado: string; // DISPONIBLE | MANTENIMIENTO | INACTIVO
}

export interface AlojamientoDto {
  idAlojamiento: string;
  idAnfitrion: string;
  titulo: string;
  ciudad: string;
  estadoPublicacion?: string;
  tipoPropiedadNombre?: string;
  servicios?: { nombre: string }[];
  fotografias?: { url: string; orden?: number }[];
  unidades?: UnidadDto[];
}

/** GET /alojamientos/{id}/valoraciones/resumen (solo lo que se usa). */
export interface ResumenValoracionesDto {
  calificacionPromedio: number | null;
  totalResenas: number;
}

/** POST /api/v1/ia/agente/turno de MS-04: un paso del agente con herramientas (nombres como en main.py). */
export interface LlamadaHerramientaDto {
  id: string;
  nombre: string;
  argumentos: Record<string, unknown>;
}

export interface MensajeAgenteDto {
  rol: 'user' | 'assistant' | 'tool';
  contenido?: string | null;
  llamadas?: LlamadaHerramientaDto[];
  llamadaId?: string;
}

export interface PeticionTurnoAgenteDto {
  sistema: string;
  mensajes: MensajeAgenteDto[];
  herramientas: { nombre: string; descripcion: string; parametros: Record<string, unknown> }[];
}

