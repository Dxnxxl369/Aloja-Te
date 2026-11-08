// ======================================================================
// ARCHIVO: agente/domain/interfaces.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Los contratos de lo que el agente necesita del mundo (MotorLenguaje, CatalogoAlojamientos, Reservador) y de lo que ofrece (CasosAgente).
// PARA QUÉ SIRVE: El agente funciona igual con IA local, IA en la nube o reglas, y se prueba sin red.
// SIN ÉL: El agente quedaría atado a un modelo o a un backend concreto.
// NO VA AQUÍ: Implementaciones (están en data/).
// ======================================================================

import type { Criterios, Disponible, EstadoAgente, Intencion, Opcion, ResultadoReservar } from './modelos';

/** Entiende un mensaje y devuelve los datos que encuentra. NUNCA ejecuta acciones. */
export interface MotorLenguaje {
  extraerIntencion(texto: string, criteriosActuales: Criterios): Promise<Intencion>;
}

export interface CatalogoAlojamientos {
  buscar(criterios: Criterios): Promise<Opcion[]>;
}

/** Lo que el agente puede hacer con reservas (se conecta al feature reservas). */
export interface Reservador {
  verificarDisponibilidad(unidadId: string, checkIn: string, checkOut: string): Promise<Disponible>;
  reservar(opcion: Opcion, criterios: Required<Pick<Criterios, 'checkIn' | 'checkOut' | 'huespedes'>>): Promise<ResultadoReservar>;
  noches(checkIn: string, checkOut: string): number | null;
  validarFechas(checkIn: string, checkOut: string): string | null;
}

/** Cada operación recibe el estado actual y devuelve el nuevo: no hay estado escondido. */
export interface CasosAgente {
  iniciar(): EstadoAgente;
  enviarMensaje(estado: EstadoAgente, texto: string): Promise<EstadoAgente>;
  elegirOpcion(estado: EstadoAgente, indice: number): Promise<EstadoAgente>;
  confirmar(estado: EstadoAgente): Promise<EstadoAgente>;
  rechazar(estado: EstadoAgente): EstadoAgente;
}
