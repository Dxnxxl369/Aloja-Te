// ======================================================================
// ARCHIVO: offline/sincronizador.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El cartero que vacía la libreta.
// PARA QUÉ SIRVE: Cuando vuelve internet envía lo pendiente en orden, reintenta con espera creciente y marca como fallido lo que el servidor rechaza.
// SIN ÉL: La cola se llenaría y nadie la enviaría.
// NO VA AQUÍ: Decidir si hay red: eso lo hace NetInfo.
// ======================================================================
// Vacía la cola cuando hay red. Reintenta con espera creciente.
// Error de red -> reprograma y corta el ciclo. Error definitivo (409, 422…) -> FALLIDA.
//
// `conectado` lo escribe SOLO NetInfo. Un error de red de una operación no lo
// toca: si lo hiciera, el temporizador de reintento quedaría bloqueado hasta que
// el sistema operativo avisara de un cambio de red (que puede no llegar nunca).

import NetInfo from '@react-native-community/netinfo';
import { SYNC } from '../base/constantes';
import { esperaMs, esReintentable } from '../base/errores';
import { AppError } from '../base/modelos';
import { crearStore } from '../base/store';
import type { ColaInterna, Sincronizador } from './interfaces';
import type { EstadoSync } from './modelos';

export function crearSincronizador(deps: { cola: ColaInterna }): Sincronizador {
  const { cola } = deps;
  const store = crearStore<EstadoSync>({ conectado: true, pendientes: 0, sincronizando: false });
  let corriendo = false;
  let temporizador: ReturnType<typeof setTimeout> | null = null;
  let quitarRed: (() => void) | null = null;
  let quitarCola: (() => void) | null = null;

  async function refrescarPendientes() {
    store.set({ pendientes: await cola.contarPendientes() });
  }

  async function programarReintento() {
    if (temporizador) clearTimeout(temporizador);
    const venc = await cola.proximoVencimiento();
    if (venc === null) return;
    temporizador = setTimeout(() => void procesar(), Math.max(1_000, venc - Date.now()));
  }

  async function procesar(): Promise<void> {
    if (corriendo || !store.get().conectado) return;
    corriendo = true;
    store.set({ sincronizando: true });
    try {
      for (;;) {
        const op = await cola.siguiente();
        if (!op) break;

        const manejador = cola.manejadorDe(op.tipo);
        if (!manejador) {
          await cola.marcarFallida(op.id, `Sin manejador para ${op.tipo}`);
          continue;
        }

        await cola.marcarEnviando(op.id);
        try {
          await manejador(op.payload, { idempotencyKey: op.idempotencyKey });
          await cola.marcarCompletada(op.id);
          console.log('Operación sincronizada', op.tipo);
        } catch (e) {
          const mensaje = e instanceof Error ? e.message : String(e);
          const intentos = op.intentos + 1;
          if (esReintentable(e) && intentos < SYNC.REINTENTOS_MAX) {
            const espera = esperaMs(intentos, SYNC.ESPERA_BASE_MS, SYNC.ESPERA_MAX_MS);
            await cola.reprogramar(op.id, intentos, Date.now() + espera, mensaje);
            // Sin red: dejar de insistir ahora; el temporizador (o NetInfo) lo retoma.
            if (e instanceof AppError && e.tipo === 'SIN_RED') break;
          } else {
            await cola.marcarFallida(op.id, mensaje);
            console.warn('Operación fallida (definitiva)', op.tipo, mensaje);
          }
        }
        await refrescarPendientes();
      }
    } finally {
      corriendo = false;
      store.set({ sincronizando: false });
      await refrescarPendientes();
      await programarReintento();
    }
  }

  return {
    async iniciar() {
      await cola.recuperarEnviando();
      await refrescarPendientes();
      quitarCola = cola.suscribir(() => {
        void refrescarPendientes();
        void procesar();
      });
      quitarRed = NetInfo.addEventListener((s) => {
        const conectado = s.isConnected === true && s.isInternetReachable !== false;
        store.set({ conectado });
        if (conectado) void procesar();
      });
      void procesar();
    },

    detener() {
      quitarRed?.();
      quitarCola?.();
      if (temporizador) clearTimeout(temporizador);
    },

    sincronizarAhora: procesar,

    estado: { get: store.get, suscribir: store.suscribir },
  };
}
