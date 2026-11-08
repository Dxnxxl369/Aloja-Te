// ======================================================================
// ARCHIVO: offline/cola.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La libreta de cosas pendientes de enviar cuando no hay internet.
// PARA QUÉ SIRVE: Guarda cada operación con su Idempotency-Key para enviarla después sin duplicarla, aunque se cierre la app.
// SIN ÉL: Sin internet, la acción del usuario se perdería.
// NO VA AQUÍ: Saber qué es una reserva o un pago. Cada feature registra su propio manejador.
// ======================================================================
// Cola de operaciones offline (el "outbox" del móvil).
//
// core NO sabe qué es una reserva ni un pago: cada feature registra un
// manejador por tipo. La Idempotency-Key se genera AL ENCOLAR y se guarda,
// así un reintento (incluso tras cerrar la app) manda siempre la misma clave.

import { crearEmisor } from '../base/store';
import { consultar, consultarUno, ejecutar } from '../db/db';
import type { ColaInterna } from './interfaces';
import type { OperacionFila } from '../db/modelos';
import type { EstadoOperacion, Manejador, Operacion } from './modelos';

/** Frontera DB -> dominio: la fila (snake_case, JSON en texto) pasa a Operacion limpia. */
const aOperacion = (f: OperacionFila): Operacion => ({
  id: f.id,
  tipo: f.tipo,
  payload: JSON.parse(f.payload),
  idempotencyKey: f.idempotency_key,
  estado: f.estado as EstadoOperacion,
  intentos: f.intentos,
  proximoIntento: f.proximo_intento,
  ultimoError: f.ultimo_error,
  creadoEn: f.creado_en,
});

export function crearCola(deps: { nuevoId: () => string }): ColaInterna {
  const manejadores = new Map<string, Manejador>();
  const cambios = crearEmisor();
  const avisar = cambios.emitir;

  return {
    registrarManejador(tipo, manejador) {
      manejadores.set(tipo, manejador);
    },

    manejadorDe(tipo) {
      return manejadores.get(tipo);
    },

    async encolar(tipo, payload) {
      const id = deps.nuevoId();
      const idempotencyKey = deps.nuevoId();
      const t = Date.now();
      await ejecutar(
        `INSERT INTO operacion_pendiente
           (id, tipo, payload, idempotency_key, estado, intentos, proximo_intento, creado_en)
         VALUES (?, ?, ?, ?, 'PENDIENTE', 0, ?, ?)`,
        [id, tipo, JSON.stringify(payload), idempotencyKey, t, t],
      );
      avisar();
      return { id, idempotencyKey };
    },

    async siguiente() {
      const f = await consultarUno<OperacionFila>(
        `SELECT * FROM operacion_pendiente
          WHERE estado = 'PENDIENTE' AND proximo_intento <= ?
          ORDER BY creado_en LIMIT 1`,
        [Date.now()],
      );
      return f ? aOperacion(f) : null;
    },

    async marcarEnviando(id) {
      await ejecutar(`UPDATE operacion_pendiente SET estado = 'ENVIANDO' WHERE id = ?`, [id]);
    },

    async marcarCompletada(id) {
      await ejecutar(`UPDATE operacion_pendiente SET estado = 'COMPLETADA', ultimo_error = NULL WHERE id = ?`, [id]);
      avisar();
    },

    async reprogramar(id, intentos, proximoIntento, error) {
      await ejecutar(
        `UPDATE operacion_pendiente
            SET estado = 'PENDIENTE', intentos = ?, proximo_intento = ?, ultimo_error = ?
          WHERE id = ?`,
        [intentos, proximoIntento, error, id],
      );
    },

    async marcarFallida(id, error) {
      await ejecutar(`UPDATE operacion_pendiente SET estado = 'FALLIDA', ultimo_error = ? WHERE id = ?`, [error, id]);
      avisar();
    },

    async recuperarEnviando() {
      await ejecutar(`UPDATE operacion_pendiente SET estado = 'PENDIENTE' WHERE estado = 'ENVIANDO'`);
    },

    async contarPendientes() {
      const f = await consultarUno<{ n: number }>(
        `SELECT COUNT(*) AS n FROM operacion_pendiente WHERE estado IN ('PENDIENTE', 'ENVIANDO')`,
      );
      return f?.n ?? 0;
    },

    async proximoVencimiento() {
      const f = await consultarUno<{ t: number | null }>(
        `SELECT MIN(proximo_intento) AS t FROM operacion_pendiente WHERE estado = 'PENDIENTE'`,
      );
      return f?.t ?? null;
    },

    async fallidas() {
      const filas = await consultar<OperacionFila>(
        `SELECT * FROM operacion_pendiente WHERE estado = 'FALLIDA' ORDER BY creado_en`,
      );
      return filas.map(aOperacion);
    },

    suscribir: cambios.suscribir,
  };
}
