// ======================================================================
// ARCHIVO: pagos/presentacion/paymentFormat.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Dos funciones que preparan datos del pago para mostrarlos: el código corto de la transacción y la hora límite para pagar.
// PARA QUÉ SIRVE: Sacar de la pantalla cálculos que se pueden probar solos, sin dibujar nada.
// SIN ÉL: PantallaPago calcularía esto dentro de su cuerpo.
// NO VA AQUÍ: Dibujo ni llamadas al servidor.
// ======================================================================

import { SHORT_ID_LENGTH } from '../constantes';

/** "9f3a2b1c-…" -> "9F3A2B1C": el código corto que se le muestra al usuario como número de transacción. */
export function shortPaymentId(id: string): string {
  return id.slice(0, SHORT_ID_LENGTH).toUpperCase();
}

/**
 * La hora a la que vence el QR ("05:42 p. m."), calculada con los segundos que quedan.
 * null si no hay un plazo corriendo (no hay QR, o ya venció).
 */
export function deadlineTime(secondsLeft: number | null, now: number): string | null {
  if (secondsLeft === null || secondsLeft <= 0) return null;
  return new Date(now + secondsLeft * 1000).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}
