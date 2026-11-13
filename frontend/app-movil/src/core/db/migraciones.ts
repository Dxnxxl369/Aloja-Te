// ======================================================================
// ARCHIVO: db/migraciones.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las tablas que core necesita siempre: la cola de operaciones y la caché de lectura.
// PARA QUÉ SIRVE: Es el "plano" de la base local de core. Se aplican una sola vez, al abrir la app.
// SIN ÉL: La cola offline y la caché no tendrían dónde guardar nada.
// NO VA AQUÍ: Tablas de un feature. Cada feature exporta las suyas y se pasan a iniciarCore({ migraciones }).
// ======================================================================
// Regla: nunca editar una migración ya publicada; para cambiar algo, agregar otra.

import type { Migracion } from './modelos';

export const MIGRACIONES_CORE: Migracion[] = [
  {
    id: 'core-001-operacion_pendiente',
    sql: `CREATE TABLE IF NOT EXISTS operacion_pendiente (
            id               TEXT PRIMARY KEY,
            tipo             TEXT NOT NULL,
            payload          TEXT NOT NULL,
            idempotency_key  TEXT NOT NULL,
            estado           TEXT NOT NULL DEFAULT 'PENDIENTE',
            intentos         INTEGER NOT NULL DEFAULT 0,
            proximo_intento  INTEGER NOT NULL,
            ultimo_error     TEXT,
            creado_en        INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_op_estado ON operacion_pendiente (estado, proximo_intento);`,
  },
  {
    // Caché de lectura: reservas, comprobantes… para verlos sin red.
    id: 'core-002-cache',
    sql: `CREATE TABLE IF NOT EXISTS cache (
            clave      TEXT PRIMARY KEY,
            valor      TEXT NOT NULL,
            expira_en  INTEGER
          );`,
  },
];
