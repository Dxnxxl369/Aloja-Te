// ======================================================================
// ARCHIVO: agente/data/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los DTO que usa el agente: alojamientos de MS-01 y el pedido/respuesta de intención de MS-04.
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
  unidades?: UnidadDto[];
}

/** PROPUESTA para MS-04 (no existe aún). */
export interface PeticionIntencionDto {
  texto: string;
  criterios: Record<string, unknown>;
  hoy: string;
}

export interface RespuestaIntencionDto {
  intencion: unknown;
}
