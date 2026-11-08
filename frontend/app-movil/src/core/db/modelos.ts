// ======================================================================
// ARCHIVO: db/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Lo que es de la base local: migraciones, parámetros y las FILAS tal como están guardadas (snake_case).
// PARA QUÉ SIRVE: Que core y cada feature describan sus tablas locales de la misma manera.
// SIN ÉL: Cada feature inventaría su propio formato de migración.
// NO VA AQUÍ: Modelos de dominio (una fila no sale de offline/cola.ts sin mapearse). SQL concreto (core: migraciones.ts; features: en su propia carpeta).
// ======================================================================

export interface Migracion {
  id: string; // único y estable, ej. 'reservas-001-reserva_local'
  sql: string;
}

export type Parametro = string | number | null;

/** Fila de la tabla operacion_pendiente, tal cual la devuelve SQLite. */
export interface OperacionFila {
  id: string;
  tipo: string;
  payload: string; // JSON en texto
  idempotency_key: string;
  estado: string; // texto; el dominio lo valida como EstadoOperacion
  intentos: number;
  proximo_intento: number;
  ultimo_error: string | null;
  creado_en: number;
}
