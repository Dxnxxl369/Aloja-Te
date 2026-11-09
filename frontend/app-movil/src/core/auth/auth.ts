// ======================================================================
// ARCHIVO: auth/auth.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Quién eres y si sigues dentro: login, guardar el token de forma segura y saber cuándo vence.
// PARA QUÉ SIRVE: Es la pieza del SSO (punto 15). Hoy usa MS-01; para pasar a Keycloak se escribe otra versión y se cambia una línea en di/composicion.ts.
// SIN ÉL: No hay usuario ni token, así que ninguna petición protegida funciona.
// NO VA AQUÍ: Pantallas de login (van en el feature de cuenta).
// ======================================================================
// Implementación de ServicioAuth contra MS-01.

import * as SecureStore from 'expo-secure-store';
import { CLAVE_SESION } from '../base/constantes';
import { AppError } from '../base/modelos';
import { crearEmisor } from '../base/store';
import type { Api } from '../http/interfaces';
import type { ServicioAuth } from './interfaces';
import type { LoginDto } from '../http/modelos';
import type { Sesion } from './modelos';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodificarBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const ch of b64) {
    if (ch === '=') break;
    const v = ABC.indexOf(ch);
    if (v < 0) throw new Error('base64 inválido');
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
      acc &= (1 << bits) - 1;
    }
  }
  return decodeURIComponent(bytes.map((x) => '%' + x.toString(16).padStart(2, '0')).join(''));
}

/** Lee el cuerpo de un JWT SIN validar la firma (la valida el backend). */
export function leerClaimsJwt(token: string): Record<string, unknown> | null {
  const partes = token.split('.');
  if (partes.length !== 3 || !partes[1]) return null;
  try {
    return JSON.parse(decodificarBase64Url(partes[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Frontera HTTP -> dominio: convierte el DTO crudo en la Sesion limpia (camelCase). */
export function sesionDesdeLoginDto(dto: LoginDto | undefined | null): Sesion {
  if (!dto?.token) throw new AppError('DESCONOCIDO', 'El login no devolvió token');
  const claims = leerClaimsJwt(dto.token);
  const usuarioId = dto.usuarioId ?? (typeof claims?.sub === 'string' ? claims.sub : '');
  if (!usuarioId) throw new AppError('DESCONOCIDO', 'No se pudo determinar el usuario');
  const rol =
    dto.rol ??
    (typeof claims?.rol === 'string'
      ? claims.rol
      : typeof claims?.role === 'string'
      ? claims.role
      : 'CLIENTE');
  return {
    token: dto.token,
    usuarioId,
    nombre: dto.nombreCompleto ?? '',
    email: dto.email ?? '',
    rol,
    expiraEn: typeof claims?.exp === 'number' ? claims.exp * 1000 : null,
  };
}

export function crearAuthMs01(deps: { api: Api; rutaLogin: string }): ServicioAuth {
  const { api, rutaLogin } = deps;
  let cache: Sesion | null | undefined; // undefined = aún no leída del almacenamiento
  const expirada = crearEmisor();

  async function borrar(): Promise<void> {
    cache = null;
    await SecureStore.deleteItemAsync(CLAVE_SESION);
  }

  async function sesionActual(): Promise<Sesion | null> {
    if (cache === undefined) {
      const crudo = await SecureStore.getItemAsync(CLAVE_SESION);
      cache = crudo ? (JSON.parse(crudo) as Sesion) : null;
    }
    if (cache && cache.expiraEn !== null && cache.expiraEn <= Date.now()) {
      await borrar();
      return null;
    }
    return cache;
  }

  return {
    async iniciarSesion(email, password) {
      // Cuerpo real de MS-01: { email, password } (portalEsperado es opcional).
      const dto = await api.post<LoginDto>(rutaLogin, { email, password });
      const sesion = sesionDesdeLoginDto(dto);
      cache = sesion;
      // Ojo: SecureStore avisa si el valor pasa de ~2 KB. Si la sesión crece, guardar solo el token.
      await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(sesion));
      return sesion;
    },

    async cerrarSesion() {
      await borrar();
    },

    sesionActual,

    async obtenerToken() {
      return (await sesionActual())?.token ?? null;
    },

    alExpirar: expirada.suscribir,

    notificarExpirada() {
      void borrar().finally(expirada.emitir);
    },
  };
}
