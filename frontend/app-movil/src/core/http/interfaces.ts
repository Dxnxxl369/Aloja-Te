// ======================================================================
// ARCHIVO: http/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El contrato del cliente de API: get, post, put, patch, delete.
// PARA QUÉ SIRVE: Los features dependen de este contrato y no de la implementación; en las pruebas se puede reemplazar por uno falso.
// SIN ÉL: Los features quedarían atados a api.ts.
// NO VA AQUÍ: Código que haga peticiones.
// ======================================================================

import type { OpcionesPeticion } from './modelos';

export interface Api {
  get<T>(ruta: string, op?: OpcionesPeticion): Promise<T>;
  post<T>(ruta: string, cuerpo?: unknown, op?: OpcionesPeticion): Promise<T>;
  put<T>(ruta: string, cuerpo?: unknown, op?: OpcionesPeticion): Promise<T>;
  patch<T>(ruta: string, cuerpo?: unknown, op?: OpcionesPeticion): Promise<T>;
  delete<T>(ruta: string, op?: OpcionesPeticion): Promise<T>;
}
