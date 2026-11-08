// ======================================================================
// ARCHIVO: reservas/domain/interfaces.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Dos contratos: RepositorioReservas (cómo se consigue/guarda una reserva) y CasosReservas (lo que la app puede hacer con reservas).
// PARA QUÉ SIRVE: Los casos no saben de HTTP ni SQLite; el agente y la UI usan CasosReservas sin conocer el repositorio.
// SIN ÉL: Los casos quedarían atados a la red y no se podrían probar solos.
// NO VA AQUÍ: Implementaciones (data/repositorio.ts y domain/casos.ts).
// ======================================================================

import type { Disponibilidad, Reserva, ResultadoCrear, SolicitudReserva } from './modelos';

export interface RepositorioReservas {
  crear(solicitud: SolicitudReserva): Promise<ResultadoCrear>;
  obtener(id: string): Promise<Reserva>;
  /** Reserva creada desde la cola offline, buscada por su idempotencyKey. null si aún no se envió. */
  obtenerPorClave(idempotencyKey: string): Promise<Reserva | null>;
  disponibilidad(unidadId: string, checkIn: string, checkOut: string): Promise<Disponibilidad>;
  /** Reservas del cliente, de la más reciente a la más antigua. Sin red usa lo último guardado. */
  listarPorCliente(clienteId: string): Promise<Reserva[]>;
}

export interface CasosReservas {
  crearReserva(solicitud: SolicitudReserva): Promise<ResultadoCrear>;
  obtenerReserva(id: string): Promise<Reserva>;
  obtenerReservaPorClave(idempotencyKey: string): Promise<Reserva | null>;
  listarReservasDeCliente(clienteId: string): Promise<Reserva[]>;
  verificarDisponibilidad(unidadId: string, checkIn: string, checkOut: string): Promise<Disponibilidad>;
  /** Mensaje de error si las fechas no sirven para reservar (formato, orden, pasado, máximo); null si están bien. */
  validarFechas(checkIn: string, checkOut: string): string | null;
  /** Noches entre dos fechas; null si alguna fecha es inválida o no hay al menos una noche. */
  noches(checkIn: string, checkOut: string): number | null;
  /** Segundos que quedan para pagar. null si no corre ningún plazo. */
  segundosRestantes(reserva: Reserva): number | null;
  /** ¿Todavía se puede pagar? */
  sePuedePagar(reserva: Reserva): boolean;
}
