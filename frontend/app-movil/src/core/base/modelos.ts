// ======================================================================
// ARCHIVO: base/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El objeto básico de error de la app, con sus atributos (tipo, mensaje, código, status).
// PARA QUÉ SIRVE: Que todos los archivos lancen y reconozcan el mismo tipo de error.
// SIN ÉL: Cada archivo inventaría su propia forma de fallar.
// NO VA AQUÍ: Funciones que decidan algo (eso va en errores.ts).
// ======================================================================

export type TipoError =
  | 'SIN_RED'
  | 'NO_AUTORIZADO'
  | 'PROHIBIDO'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'VALIDACION'
  | 'SERVIDOR'
  | 'DESCONOCIDO';

export class AppError extends Error {
  constructor(
    readonly tipo: TipoError,
    mensaje: string,
    readonly codigo?: string, // código de negocio que manda el backend, ej. SIN_DISPONIBILIDAD
    readonly status?: number,
    readonly causa?: unknown,
  ) {
    super(mensaje);
    this.name = 'AppError';
  }
}
