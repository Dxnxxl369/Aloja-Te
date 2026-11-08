// ======================================================================
// ARCHIVO: http/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los datos del lado HTTP: opciones de petición, dependencias y los DTO (la forma CRUDA que manda el backend).
// PARA QUÉ SIRVE: Tener en un solo lugar la forma de esos objetos.
// SIN ÉL: Estarían mezclados dentro de la lógica de api.ts.
// NO VA AQUÍ: Funciones, ni modelos de dominio. Un DTO nunca sale de la capa que lo recibe: se mapea al modelo de dominio.
// ======================================================================

export type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OpcionesPeticion {
  idempotencyKey?: string;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export interface DependenciasApi {
  baseUrl: string;
  nuevoId: () => string;
  /** Se inyecta como función: así http no depende de auth (evita el ciclo). */
  obtenerToken?: () => Promise<string | null>;
  alExpirarSesion?: () => void;
}

// DTO del login de MS-01 (AuthResponseDto.java): así llega del backend, en camelCase.
// Solo auth/auth.ts (sesionDesdeLoginDto) conoce esta forma.
export interface LoginDto {
  token: string;
  usuarioId: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  estado?: string;
  mensaje?: string;
}
