// ======================================================================
// ARCHIVO: http/api.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El mensajero entre la app y el backend.
// PARA QUÉ SIRVE: Toda petición (login, reservar, pagar) sale por aquí: pone el token, la Idempotency-Key y corta si tarda demasiado.
// SIN ÉL: La app no puede hablar con ningún microservicio.
// NO VA AQUÍ: Rutas o datos de un feature concreto (reservas, pagos). Eso va en cada feature.
// ======================================================================
// Cliente de API contra el Gateway. Añade token, Idempotency-Key y
// X-Correlation-Id; aplica timeout; reintenta SOLO los GET.
// Un POST nunca se reintenta aquí: eso lo hace la cola offline con su clave.

import { errorDesdeHttp, esperaMs, esReintentable } from '../base/errores';
import { HTTP } from '../base/constantes';
import { AppError } from '../base/modelos';
import type { Api } from './interfaces';
import type { DependenciasApi, Metodo, OpcionesPeticion } from './modelos';

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function crearApi(deps: DependenciasApi): Api {
  const { baseUrl, nuevoId, obtenerToken, alExpirarSesion } = deps;

  function armarUrl(ruta: string, query?: OpcionesPeticion['query']): string {
    const partes = query
      ? Object.entries(query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      : [];
    if (partes.length === 0) return `${baseUrl}${ruta}`;
    return `${baseUrl}${ruta}${ruta.includes('?') ? '&' : '?'}${partes.join('&')}`;
  }

  async function una<T>(
    metodo: Metodo,
    ruta: string,
    cuerpo: unknown,
    op: OpcionesPeticion,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Correlation-Id': nuevoId(),
    };
    if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
    if (op.idempotencyKey) headers['Idempotency-Key'] = op.idempotencyKey;
    const token = obtenerToken ? await obtenerToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), HTTP.TIMEOUT_MS);
    op.signal?.addEventListener('abort', () => control.abort());

    let res: Response;
    try {
      res = await fetch(armarUrl(ruta, op.query), {
        method: metodo,
        headers,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        signal: control.signal,
      });
    } catch (causa) {
      throw new AppError('SIN_RED', 'No se pudo conectar con el servidor', undefined, undefined, causa);
    } finally {
      clearTimeout(reloj);
    }

    const texto = await res.text();
    let datos: unknown;
    if (texto) {
      try {
        datos = JSON.parse(texto);
      } catch {
        datos = texto;
      }
    }

    if (!res.ok) {
      if (res.status === 401) alExpirarSesion?.();
      throw errorDesdeHttp(res.status, datos);
    }
    return datos as T;
  }

  async function conReintentos<T>(
    metodo: Metodo,
    ruta: string,
    cuerpo: unknown,
    op: OpcionesPeticion,
  ): Promise<T> {
    const max = metodo === 'GET' ? HTTP.REINTENTOS_GET : 0;
    for (let intento = 0; ; intento++) {
      try {
        return await una<T>(metodo, ruta, cuerpo, op);
      } catch (e) {
        if (intento >= max || !esReintentable(e)) throw e;
        const espera = esperaMs(intento + 1, HTTP.ESPERA_GET_BASE_MS, HTTP.ESPERA_GET_MAX_MS);
        console.warn(`GET ${ruta} falló, reintento ${intento + 1}/${max} en ${espera} ms`);
        await esperar(espera);
      }
    }
  }

  return {
    get: (ruta, op = {}) => conReintentos('GET', ruta, undefined, op),
    post: (ruta, cuerpo, op = {}) => conReintentos('POST', ruta, cuerpo, op),
    put: (ruta, cuerpo, op = {}) => conReintentos('PUT', ruta, cuerpo, op),
    patch: (ruta, cuerpo, op = {}) => conReintentos('PATCH', ruta, cuerpo, op),
    delete: (ruta, op = {}) => conReintentos('DELETE', ruta, undefined, op),
  };
}
