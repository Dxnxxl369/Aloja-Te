// ======================================================================
// ARCHIVO: reservas/domain/modelos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Qué es una reserva para la app: lo que se pide (SolicitudReserva) y lo que se tiene (Reserva).
// PARA QUÉ SIRVE: Un solo vocabulario para el agente, la UI y los pagos, sin depender de cómo lo llame el backend.
// SIN ÉL: Cada pantalla usaría el JSON crudo de MS-02.
// NO VA AQUÍ: Funciones ni nada de red/SQL. Los DTO viven en data/modelos.ts.
// ======================================================================

import type { ESTADOS_RESERVA } from '../constantes';

export type EstadoReserva = (typeof ESTADOS_RESERVA)[number];

/** Lo que el usuario (o el agente) pide reservar. */
export interface SolicitudReserva {
  clienteId: string;
  clienteNombre: string;
  anfitrionId: string;
  alojamientoId: string;
  alojamientoTitulo: string;
  unidadId: string;
  unidadNombre: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  huespedes: number;
  precioNoche: number; // BOB
}

/** Una reserva ya creada en el servidor. */
export interface Reserva {
  id: string;
  clienteId: string;
  anfitrionId: string;
  alojamientoId: string;
  alojamientoTitulo: string;
  unidadId: string;
  unidadNombre: string;
  checkIn: string;
  checkOut: string;
  noches: number;
  huespedes: number;
  precioNoche: number;
  total: number;
  moneda: string;
  estado: EstadoReserva;
  codigoCheckin: string;
  /** Hasta cuándo está bloqueada sin pagar (epoch ms). null si ya no corre plazo. */
  bloqueadaHasta: number | null;
}

/**
 * Datos del alojamiento que la reserva no trae (MS-02 solo guarda el título): foto y lugar.
 * Los consigue quien arma la pantalla; todos los campos son opcionales porque MS-01 puede no enviarlos.
 */
export interface FichaAlojamiento {
  fotoUrl?: string;
  /** "Dirección, Ciudad". */
  ubicacion?: string;
  /** El alojamiento está publicado, es decir, ya pasó la moderación. */
  verificado?: boolean;
}

/**
 * Resultado de pedir una reserva:
 *  - CREADA: el servidor respondió.
 *  - EN_COLA: no había red; quedó guardada y se enviará sola. `idempotencyKey` identifica la solicitud.
 */
export type ResultadoCrear =
  | { tipo: 'CREADA'; reserva: Reserva }
  | { tipo: 'EN_COLA'; idempotencyKey: string };

export interface Disponibilidad {
  disponible: boolean;
  fechasBloqueadas: string[];
}
