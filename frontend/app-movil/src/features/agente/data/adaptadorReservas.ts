// ======================================================================
// ARCHIVO: agente/data/adaptadorReservas.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El puente entre el agente y el feature reservas: convierte "reservar esta opción" en una SolicitudReserva.
// PARA QUÉ SIRVE: El agente no conoce a MS-02; solo ve el contrato `Reservador`. Tampoco duplica reglas: usa las de reservas.
// SIN ÉL: El agente no podría crear reservas.
// NO VA AQUÍ: Reglas de reserva (están en reservas/domain).
// ======================================================================

import { esSinRed } from '../../../core';
import type { CasosReservas } from '../../reservas';
import type { Cliente } from '../domain/modelos';
import type { Reservador } from '../domain/interfaces';

export function crearReservadorDesdeCasos(deps: {
  casos: CasosReservas;
  obtenerCliente: () => Promise<Cliente>;
}): Reservador {
  const { casos, obtenerCliente } = deps;
  return {
    async verificarDisponibilidad(unidadId, checkIn, checkOut) {
      try {
        const d = await casos.verificarDisponibilidad(unidadId, checkIn, checkOut);
        return d.disponible ? 'SI' : 'NO';
      } catch (e) {
        if (esSinRed(e)) return 'DESCONOCIDA';
        throw e;
      }
    },

    async reservar(opcion, c) {
      const cliente = await obtenerCliente();
      const r = await casos.crearReserva({
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        anfitrionId: opcion.anfitrionId,
        alojamientoId: opcion.alojamientoId,
        alojamientoTitulo: opcion.titulo,
        unidadId: opcion.unidadId,
        unidadNombre: opcion.unidadNombre,
        checkIn: c.checkIn,
        checkOut: c.checkOut,
        huespedes: c.huespedes,
        precioNoche: opcion.precioNoche,
      });
      return r.tipo === 'CREADA'
        ? { tipo: 'CREADA', reservaId: r.reserva.id, total: r.reserva.total }
        : { tipo: 'EN_COLA', clave: r.idempotencyKey };
    },

    noches: (a, b) => casos.noches(a, b),
    validarFechas: (a, b) => casos.validarFechas(a, b),
  };
}
