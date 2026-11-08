// ======================================================================
// ARCHIVO: offline/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los modelos de DOMINIO de la cola offline (camelCase): operación pendiente, su estado y el estado del sincronizador.
// PARA QUÉ SIRVE: Una sola definición de qué es una "operación pendiente" para la cola, el sincronizador y los features.
// SIN ÉL: La forma de una operación estaría repartida dentro de cola.ts y sincronizador.ts.
// NO VA AQUÍ: La fila de la tabla (OperacionFila, en db/modelos.ts) ni funciones.
// ======================================================================

export type EstadoOperacion = 'PENDIENTE' | 'ENVIANDO' | 'FALLIDA' | 'COMPLETADA';

export interface Operacion {
  id: string;
  tipo: string;
  payload: unknown;
  idempotencyKey: string;
  estado: EstadoOperacion;
  intentos: number;
  proximoIntento: number;
  ultimoError: string | null;
  creadoEn: number;
}

/** Lo que hace un feature cuando le toca enviar una operación. Debe lanzar AppError si falla. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Manejador = (payload: any, contexto: { idempotencyKey: string }) => Promise<void>;

export interface EstadoSync {
  conectado: boolean;
  pendientes: number;
  sincronizando: boolean;
}
