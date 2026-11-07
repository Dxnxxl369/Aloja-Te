// ======================================================================
// ARCHIVO: di/composicion.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El tablero donde se enchufa todo.
// PARA QUÉ SIRVE: Crea cada pieza y las conecta. Aquí se cambia MS-01 por Keycloak o se conecta el motor de IA.
// SIN ÉL: Nada arranca.
// NO VA AQUÍ: Lógica ni valores fijos (los valores están en base/constantes.ts). Solo crear y conectar.
// ======================================================================
// Aquí se crean las piezas y se conectan. Es el ÚNICO archivo que sabe qué
// implementación concreta se usa en cada caso.

import { randomUUID } from 'expo-crypto';
import * as Device from 'expo-device';
import { crearAuthMs01 } from '../auth/auth';
import type { ServicioAuth } from '../auth/interfaces';
import { API_URL, IA_LOCAL_HABILITADA, IA_RUNTIME, MODELO_IA, RUTA_LOGIN } from '../base/constantes';
import { useStore } from '../base/store';
import { iniciarDb } from '../db/db';
import type { Migracion } from '../db/modelos';
import { crearApi } from '../http/api';
import type { Api } from '../http/interfaces';
import type { ModeloLocal, RuntimeIA } from '../ia/interfaces';
import { crearModeloLocal } from '../ia/modeloLocal';
import { crearRuntimeLlama } from '../ia/runtimeLlama';
import { crearCola } from '../offline/cola';
import type { Cola, Sincronizador } from '../offline/interfaces';
import { crearSincronizador } from '../offline/sincronizador';

export const nuevoId = (): string => randomUUID();

// --- Red y sesión -----------------------------------------------------------
// apiPublica no lleva token: se usa para el login (evita el ciclo http <-> auth).
const apiPublica = crearApi({ baseUrl: API_URL, nuevoId });

// >>> Para pasar a Keycloak, cambiar SOLO esta línea por crearAuthKeycloak(...)
export const auth: ServicioAuth = crearAuthMs01({ api: apiPublica, rutaLogin: RUTA_LOGIN });

export const api: Api = crearApi({
  baseUrl: API_URL,
  nuevoId,
  obtenerToken: auth.obtenerToken,
  alExpirarSesion: auth.notificarExpirada,
});

// --- Offline ----------------------------------------------------------------
const colaInterna = crearCola({ nuevoId });
export const cola: Cola = colaInterna; // los features solo ven la parte pública
export const sincronizador: Sincronizador = crearSincronizador({ cola: colaInterna });
export const useEstadoSync = () => useStore(sincronizador.estado);

// --- IA local ---------------------------------------------------------------
// >>> Para cambiar de motor, cambiar SOLO esta línea (ej. otro runtime que cumpla RuntimeIA).
const runtimeIA: RuntimeIA = crearRuntimeLlama({
  config: {
    contextoTokens: IA_RUNTIME.CONTEXTO_TOKENS,
    maxTokensRespuesta: IA_RUNTIME.MAX_TOKENS_RESPUESTA,
    temperatura: IA_RUNTIME.TEMPERATURA,
    capasGpu: Device.osName === 'iOS' ? IA_RUNTIME.CAPAS_GPU_IOS : IA_RUNTIME.CAPAS_GPU_ANDROID,
  },
});

export const modeloLocal: ModeloLocal = crearModeloLocal({
  habilitado: IA_LOCAL_HABILITADA,
  runtime: runtimeIA,
  modelo: MODELO_IA,
});
export const useEstadoModelo = () => useStore(modeloLocal.store).estado;

// --- Arranque ---------------------------------------------------------------
/**
 * Llamar una vez, antes de mostrar la primera pantalla.
 * `migraciones`: las tablas locales de cada feature, ej.
 *   await iniciarCore({ migraciones: [...migracionesReservas, ...migracionesPagos] });
 *
 * ORDEN: crear los features (crearFeatures) ANTES de llamar a iniciarCore. El sincronizador
 * empieza a vaciar la cola apenas arranca y necesita que cada feature ya haya registrado su
 * manejador; si no, marcaría como FALLIDA una operación que quedó pendiente de la sesión anterior.
 */
export async function iniciarCore(opciones: { migraciones?: Migracion[] } = {}): Promise<void> {
  await iniciarDb(opciones.migraciones);
  await sincronizador.iniciar();
}
