// ======================================================================
// ARCHIVO: reservas/index.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La puerta del feature y el ÚNICO archivo que conoce domain, data y presentacion a la vez.
// PARA QUÉ SIRVE: Arma el repositorio real, se lo da a los casos y expone solo lo que otros necesitan.
// SIN ÉL: Nadie ensamblaría las tres capas.
// NO VA AQUÍ: Lógica. Solo conectar.
// ======================================================================

import type { Api, Cola } from '../../core';
import { crearRepositorioReservas } from './data/repositorio';
import { crearCasosReservas } from './domain/casos';
import type { CasosReservas } from './domain/interfaces';

export function crearFeatureReservas(deps: {
  api: Api;
  cola: Cola;
  nuevoId: () => string;
  guardarCache: (clave: string, valor: unknown, ttlMs?: number) => Promise<void>;
  leerCache: <T>(clave: string) => Promise<T | null>;
  ahora?: () => number;
}): { casos: CasosReservas } {
  const repo = crearRepositorioReservas(deps);
  repo.registrarManejadores(); // la cola ya sabe enviar reservas pendientes
  return { casos: crearCasosReservas({ repo, ahora: deps.ahora }) };
}

export { PantallaReserva } from './presentacion/pantallas/PantallaReserva';
export { PantallaMisReservas } from './presentacion/pantallas/PantallaMisReservas';
export { PantallaReservaManual } from './presentacion/pantallas/PantallaReservaManual';
export type { CasosReservas, RepositorioReservas } from './domain/interfaces';
export type {
  AlojamientoReservable,
  Disponibilidad,
  EstadoReserva,
  FichaAlojamiento,
  Reserva,
  ResultadoCrear,
  SolicitudReserva,
  UnidadReservable,
} from './domain/modelos';
