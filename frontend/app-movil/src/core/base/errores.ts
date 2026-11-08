// ======================================================================
// ARCHIVO: base/errores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las reglas sobre los fallos: traduce respuestas HTTP a AppError y decide si conviene reintentar y cuánto esperar.
// PARA QUÉ SIRVE: Que cualquier pantalla entienda qué pasó sin leer códigos HTTP, y que haya UNA sola política de reintento.
// SIN ÉL: Cada archivo decidiría por su cuenta cuándo reintentar.
// NO VA AQUÍ: La definición de AppError (está en modelos.ts) ni textos para el usuario.
// ======================================================================

import { AppError } from './modelos';
import type { TipoError } from './modelos';

/** Traduce una respuesta HTTP con error. Espera el cuerpo { codigo, mensaje }. */
export function errorDesdeHttp(status: number, cuerpo: unknown): AppError {
  const c = (typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {}) as {
    codigo?: unknown;
    mensaje?: unknown;
    message?: unknown;
  };
  const codigo = typeof c.codigo === 'string' ? c.codigo : undefined;
  const mensaje =
    typeof c.mensaje === 'string'
      ? c.mensaje
      : typeof c.message === 'string'
        ? c.message
        : `Error ${status}`;

  let tipo: TipoError = 'DESCONOCIDO';
  if (status === 400 || status === 422) tipo = 'VALIDACION';
  else if (status === 401) tipo = 'NO_AUTORIZADO';
  else if (status === 403) tipo = 'PROHIBIDO';
  else if (status === 404) tipo = 'NO_ENCONTRADO';
  else if (status === 409) tipo = 'CONFLICTO';
  else if (status >= 500) tipo = 'SERVIDOR';

  return new AppError(tipo, mensaje, codigo, status);
}

// --- Política de reintento (única en toda la app) ---------------------------

/** ¿Falló por falta de conexión? Los features la usan para decidir si encolan la operación. */
export function esSinRed(e: unknown): boolean {
  return e instanceof AppError && e.tipo === 'SIN_RED';
}

/** ¿Vale la pena reintentar? Solo fallos de red o del servidor. */
export function esReintentable(e: unknown): boolean {
  return esSinRed(e) || (e instanceof AppError && e.tipo === 'SERVIDOR');
}

/**
 * Espera antes del reintento n (n >= 1): exponencial, con tope y algo de azar
 * para que varios dispositivos no reintenten a la vez. La usan http y sincronizador.
 */
export function esperaMs(intento: number, baseMs: number, maxMs: number): number {
  const exponencial = Math.min(maxMs, baseMs * 2 ** (intento - 1));
  return Math.round(exponencial * (0.5 + Math.random() / 2));
}
