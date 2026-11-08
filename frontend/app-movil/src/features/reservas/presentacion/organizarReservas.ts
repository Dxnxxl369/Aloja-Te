// ======================================================================
// ARCHIVO: reservas/presentacion/organizarReservas.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Separa las reservas en "activas" y "anteriores", las cuenta y las ordena para la lista.
// PARA QUÉ SIRVE: Que la pantalla solo pinte; las reglas de qué es "activa" se pueden probar sin React.
// SIN ÉL: La pantalla mezclaría esos filtros con el diseño.
// NO VA AQUÍ: Cargar reservas ni diseño.
// ======================================================================
// "Activa" = todavía puede pasar algo: falta pagarla, está confirmada o ya hizo check-in.

import type { EstadoReserva, Reserva } from '../domain/modelos';

export type FiltroReservas = 'TODAS' | 'ACTIVAS' | 'ANTERIORES';

const ACTIVAS: readonly EstadoReserva[] = ['PENDIENTE_PAGO', 'CONFIRMADA', 'CHECKIN_REALIZADO'];

export function esActiva(r: Reserva): boolean {
  return ACTIVAS.includes(r.estado);
}

export function contarReservas(reservas: Reserva[]): Record<FiltroReservas, number> {
  const activas = reservas.filter(esActiva).length;
  return { TODAS: reservas.length, ACTIVAS: activas, ANTERIORES: reservas.length - activas };
}

/**
 * - TODAS: en el orden que llegan (la más reciente primero).
 * - ACTIVAS: las que esperan pago primero y luego la estadía más próxima.
 * - ANTERIORES: en el orden que llegan.
 * No modifica la lista original.
 */
export function organizarReservas(reservas: Reserva[], filtro: FiltroReservas): Reserva[] {
  if (filtro === 'TODAS') return [...reservas];
  if (filtro === 'ANTERIORES') return reservas.filter((r) => !esActiva(r));
  return reservas
    .filter(esActiva)
    .sort(
      (a, b) =>
        Number(b.estado === 'PENDIENTE_PAGO') - Number(a.estado === 'PENDIENTE_PAGO') || a.checkIn.localeCompare(b.checkIn),
    );
}
