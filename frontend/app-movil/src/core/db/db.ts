// ======================================================================
// ARCHIVO: db/db.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La base de datos del celular (SQLite).
// PARA QUÉ SIRVE: Abre la base, aplica las migraciones pendientes y ofrece consultar/ejecutar/transaccion y la caché de lectura para ver datos sin internet.
// SIN ÉL: No hay modo offline (puntos 7 y 8).
// NO VA AQUÍ: SQL de tablas (va en migraciones.ts o en el feature).
// ======================================================================
// SQLite local. Los features NO importan expo-sqlite: usan estos helpers.
//
// Migraciones: cada una tiene un id ÚNICO y estable. Se aplica una sola vez y
// queda anotada en la tabla _migraciones. Así el orden en que cada feature
// registre las suyas no importa, y un feature nuevo no desordena a los demás.

import * as SQLite from 'expo-sqlite';
import { NOMBRE_BD } from '../base/constantes';
import { MIGRACIONES_CORE } from './migraciones';
import type { Migracion, Parametro } from './modelos';

let conexion: Promise<SQLite.SQLiteDatabase> | null = null;
const abrir = () => (conexion ??= SQLite.openDatabaseAsync(NOMBRE_BD));

/** Llamar una vez al arrancar. `extra` = migraciones de los features. */
export async function iniciarDb(extra: Migracion[] = []): Promise<void> {
  const todas = [...MIGRACIONES_CORE, ...extra];
  const vistos = new Set<string>();
  for (const m of todas) {
    if (vistos.has(m.id)) throw new Error(`Migración repetida: ${m.id}`);
    vistos.add(m.id);
  }

  const db = await abrir();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS _migraciones (id TEXT PRIMARY KEY, aplicada_en INTEGER NOT NULL);',
  );
  // Limpieza de caché local para sincronizar con base de datos en 0
  await db.execAsync('CREATE TABLE IF NOT EXISTS cache (clave TEXT PRIMARY KEY, valor TEXT NOT NULL, expira_en INTEGER); DELETE FROM cache;');
  const hechas = new Set(
    (await db.getAllAsync<{ id: string }>('SELECT id FROM _migraciones')).map((f) => f.id),
  );

  for (const m of todas) {
    if (hechas.has(m.id)) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      await db.runAsync('INSERT INTO _migraciones (id, aplicada_en) VALUES (?, ?)', [m.id, Date.now()]);
    });
  }
}

export async function consultar<T>(sql: string, params: Parametro[] = []): Promise<T[]> {
  return (await abrir()).getAllAsync<T>(sql, params);
}

export async function consultarUno<T>(sql: string, params: Parametro[] = []): Promise<T | null> {
  return (await (await abrir()).getFirstAsync<T>(sql, params)) ?? null;
}

export async function ejecutar(sql: string, params: Parametro[] = []): Promise<void> {
  await (await abrir()).runAsync(sql, params);
}

export async function transaccion<T>(fn: () => Promise<T>): Promise<T> {
  const db = await abrir();
  let resultado!: T;
  await db.withTransactionAsync(async () => {
    resultado = await fn();
  });
  return resultado;
}

// --- Caché de lectura -------------------------------------------------------

export async function guardarCache(clave: string, valor: unknown, ttlMs?: number): Promise<void> {
  const expira = ttlMs ? Date.now() + ttlMs : null;
  await ejecutar('INSERT OR REPLACE INTO cache (clave, valor, expira_en) VALUES (?, ?, ?)', [
    clave,
    JSON.stringify(valor),
    expira,
  ]);
}

export async function leerCache<T>(clave: string): Promise<T | null> {
  const fila = await consultarUno<{ valor: string; expira_en: number | null }>(
    'SELECT valor, expira_en FROM cache WHERE clave = ?',
    [clave],
  );
  if (!fila) return null;
  if (fila.expira_en !== null && fila.expira_en <= Date.now()) return null;
  return JSON.parse(fila.valor) as T;
}
