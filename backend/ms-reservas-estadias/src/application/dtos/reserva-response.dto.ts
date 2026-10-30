import { EstadoReserva } from '../../domain/enums/estado-reserva.enum';
import { DetalleEstadia, HistorialEventoReserva } from '../../domain/entities/reserva.entity';

export class ReservaResponseDto {
  idReserva: string;
  idCliente: string;
  nombreCliente: string;
  idAnfitrion: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;

  checkIn: string;
  checkOut: string;
  nochesEstadia: number;
  cantidadHuespedes: number;
  cantidadUnidades: number;

  precioNoche: number;
  importeTotal: number;
  moneda: string;

  estado: EstadoReserva;
  codigoCheckin: string;
  sagaId: string;
  ttl?: number;

  detalleEstadia?: DetalleEstadia;
  historialEventos?: HistorialEventoReserva[];

  fechaCreacion: string;
  fechaActualizacion: string;
}
