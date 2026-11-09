// ======================================================================
// ARCHIVO: agente/data/adaptadorConsultas.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los puentes entre el agente y el resto de la app: las reservas del usuario (ver y cancelar) y la ficha de un alojamiento (solo lectura).
// PARA QUÉ SIRVE: Que la IA pueda contestar "¿ya pagué?" o "¿tiene wifi?" sin conocer MS-01 ni MS-02 y sin importar otros features.
// SIN ÉL: Las herramientas de consulta y de cancelar no tendrían de dónde sacar los datos.
// NO VA AQUÍ: Reglas de reserva ni de catálogo (están en sus features); tampoco los candados de la IA (eso es domain/llmCases.ts).
// ======================================================================
// La ficha se pide como una función (`fetchDetails`) y se mapea por su forma, así no hay que importar el feature catálogo.

import type { CasosReservas } from '../../reservas';
import type { AccommodationDetailsSource, BookingsSource } from '../domain/interfaces';
import type { Cliente } from '../domain/modelos';

const SECONDS_PER_MINUTE = 60;

export function createBookingsSource(deps: { casos: CasosReservas; obtenerCliente: () => Promise<Cliente> }): BookingsSource {
  const { casos, obtenerCliente } = deps;
  return {
    async list() {
      const cliente = await obtenerCliente();
      const reservas = await casos.listarReservasDeCliente(cliente.id);
      return reservas.map((r) => {
        const seconds = casos.segundosRestantes(r);
        return {
          id: r.id,
          alojamiento: r.alojamientoTitulo,
          habitacion: r.unidadNombre,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          noches: r.noches,
          huespedes: r.huespedes,
          totalBs: r.total,
          estado: r.estado,
          minutosParaPagar: seconds === null || seconds <= 0 ? null : Math.ceil(seconds / SECONDS_PER_MINUTE),
          sePuedePagar: casos.sePuedePagar(r),
        };
      });
    },
    async cancel(bookingId) {
      // El feature reservas pregunta al servidor el estado actual y solo cancela si sigue pendiente de pago.
      await casos.cancelarReserva(bookingId);
    },
  };
}

/** Lo mínimo que se necesita de la ficha del catálogo (DetalleAlojamiento lo cumple tal cual). */
export interface DetailsLike {
  titulo: string;
  tipo?: string;
  ciudad: string;
  direccion?: string;
  descripcion?: string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
  servicios: string[];
  calificacion: number | null;
  totalResenas: number;
}

export function createDetailsSource(deps: { fetchDetails: (accommodationId: string) => Promise<DetailsLike> }): AccommodationDetailsSource {
  return {
    async details(accommodationId) {
      const d = await deps.fetchDetails(accommodationId);
      return {
        titulo: d.titulo,
        tipo: d.tipo,
        ciudad: d.ciudad,
        direccion: d.direccion,
        descripcion: d.descripcion,
        politicas: d.politicas,
        horarioEntrada: d.horarioEntrada,
        horarioSalida: d.horarioSalida,
        servicios: d.servicios,
        calificacion: d.calificacion,
        totalResenas: d.totalResenas,
      };
    },
  };
}
