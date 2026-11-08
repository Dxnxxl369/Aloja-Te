// ======================================================================
// ARCHIVO: reservas/data/mapeadores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las funciones que traducen entre el DTO de MS-02 y el modelo de la app.
// PARA QUÉ SIRVE: Es la única frontera: nada del backend pasa a la app sin pasar por aquí.
// SIN ÉL: La UI dependería de nombres como `nochesEstadia` o de ttl en segundos.
// NO VA AQUÍ: Llamadas a la red ni a la base.
// ======================================================================

import { ESTADOS_RESERVA } from '../constantes';
import type { Disponibilidad, EstadoReserva, Reserva, SolicitudReserva } from '../domain/modelos';
import type { CrearReservaDto, DisponibilidadDto, ReservaDto } from './modelos';

/** Dominio -> DTO (lo que se envía). */
export function dtoDesdeSolicitud(s: SolicitudReserva, idempotencyKey: string): CrearReservaDto {
  return {
    idCliente: s.clienteId,
    nombreCliente: s.clienteNombre,
    idAnfitrion: s.anfitrionId,
    idAlojamiento: s.alojamientoId,
    tituloAlojamiento: s.alojamientoTitulo,
    idUnidad: s.unidadId,
    nombreUnidad: s.unidadNombre,
    checkIn: s.checkIn,
    checkOut: s.checkOut,
    cantidadHuespedes: s.huespedes,
    precioNoche: s.precioNoche,
    idempotencyKey,
  };
}

function estadoValido(texto: string): EstadoReserva {
  if ((ESTADOS_RESERVA as readonly string[]).includes(texto)) return texto as EstadoReserva;
  throw new Error(`Estado de reserva desconocido: ${texto}`);
}

/** DTO -> dominio (lo que se recibe). */
export function reservaDesdeDto(d: ReservaDto): Reserva {
  const estado = estadoValido(d.estado);
  return {
    id: d.idReserva,
    clienteId: d.idCliente,
    anfitrionId: d.idAnfitrion,
    alojamientoId: d.idAlojamiento,
    alojamientoTitulo: d.tituloAlojamiento,
    unidadId: d.idUnidad,
    unidadNombre: d.nombreUnidad,
    checkIn: d.checkIn,
    checkOut: d.checkOut,
    noches: d.nochesEstadia,
    huespedes: d.cantidadHuespedes,
    precioNoche: d.precioNoche,
    total: d.importeTotal,
    moneda: d.moneda,
    estado,
    codigoCheckin: d.codigoCheckin,
    bloqueadaHasta: estado === 'PENDIENTE_PAGO' && typeof d.ttl === 'number' ? d.ttl * 1000 : null,
  };
}

export function disponibilidadDesdeDto(d: DisponibilidadDto): Disponibilidad {
  return { disponible: d.disponible === true, fechasBloqueadas: d.fechasBloqueadas ?? [] };
}
