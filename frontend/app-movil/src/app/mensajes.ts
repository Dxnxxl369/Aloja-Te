// ======================================================================
// ARCHIVO: app/mensajes.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los textos para el usuario cuando algo falla (hoy: el inicio de sesión).
// PARA QUÉ SIRVE: core entrega AppError con un tipo; aquí se decide qué le decimos a la persona.
// SIN ÉL: Se mostrarían mensajes técnicos ("Error 401") en la pantalla.
// NO VA AQUÍ: Lógica de login (core/auth) ni pantallas.
// ======================================================================

import { AppError } from '../core';

export function mensajeDeLogin(e: unknown): string {
  if (e instanceof AppError) {
    switch (e.tipo) {
      case 'NO_AUTORIZADO':
        return 'Correo o contraseña incorrectos.';
      case 'SIN_RED':
        return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
      case 'SERVIDOR':
        return 'El servidor tuvo un problema. Inténtalo de nuevo en un momento.';
      default:
        return e.message;
    }
  }
  return e instanceof Error ? e.message : 'No se pudo iniciar sesión.';
}
