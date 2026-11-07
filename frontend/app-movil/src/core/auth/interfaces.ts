// ======================================================================
// ARCHIVO: auth/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El contrato de la autenticación: iniciar sesión, cerrarla, saber quién eres y dar el token.
// PARA QUÉ SIRVE: Es lo único que usa el resto de la app. Para pasar de MS-01 a Keycloak se escribe otra implementación de este contrato (SSO, punto 15).
// SIN ÉL: La app quedaría atada a una forma concreta de iniciar sesión.
// NO VA AQUÍ: Código que haga el login.
// ======================================================================

import type { Sesion } from './modelos';

export interface ServicioAuth {
  iniciarSesion(email: string, password: string): Promise<Sesion>;
  cerrarSesion(): Promise<void>;
  sesionActual(): Promise<Sesion | null>;
  obtenerToken(): Promise<string | null>;
  /** Avisa cuando la sesión venció o el servidor respondió 401. */
  alExpirar(callback: () => void): () => void;
  notificarExpirada(): void;
}
