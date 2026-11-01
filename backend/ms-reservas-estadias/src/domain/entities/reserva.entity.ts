import { EstadoReserva } from '../enums/estado-reserva.enum';

export interface DetalleEstadia {
  checkinConfirmadoEn?: string;
  checkoutConfirmadoEn?: string;
  notasHuesped?: string;
  codigoVerificado?: boolean;
}

export interface HistorialEventoReserva {
  tipoEvento: string;
  origen: string;
  fechaEvento: string;
  payload?: any;
}

export class ReservaEntity {
  pk: string; // RESERVA#<idReserva>
  sk: string; // METADATA

  // GSI 1: Acceso por Cliente
  gsi1Pk: string; // CLIENTE#<idCliente>
  gsi1Sk: string; // FECHA#<checkIn>

  // GSI 2: Acceso por Unidad
  gsi2Pk: string; // UNIDAD#<idUnidad>
  gsi2Sk: string; // FECHA#<checkIn>

  idReserva: string;
  idCliente: string;
  nombreCliente: string;
  idAnfitrion: string;
  nombreAnfitrion?: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;

  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  horaEstimadaLlegada?: string; // HH:mm
  nochesEstadia: number;
  cantidadHuespedes: number;
  cantidadUnidades: number;

  precioNoche: number;
  importeTotal: number;
  moneda: string; // 'BOB'

  estado: EstadoReserva;
  codigoCheckin: string; // PIN de 6 dígitos para ingreso
  sagaId: string;
  idempotencyKey?: string;

  version: number;
  ttl?: number; // Epoch timestamp para expiración automática en DynamoDB

  detalleEstadia?: DetalleEstadia;
  historialEventos?: HistorialEventoReserva[];

  fechaCreacion: string;
  fechaActualizacion: string;

  constructor(partial: Partial<ReservaEntity>) {
    Object.assign(this, partial);
    if (!this.pk && this.idReserva) {
      this.pk = `RESERVA#${this.idReserva}`;
      this.sk = 'METADATA';
    }
    if (!this.gsi1Pk && this.idCliente) {
      this.gsi1Pk = `CLIENTE#${this.idCliente}`;
      this.gsi1Sk = `FECHA#${this.checkIn}`;
    }
    if (!this.gsi2Pk && this.idUnidad) {
      this.gsi2Pk = `UNIDAD#${this.idUnidad}`;
      this.gsi2Sk = `FECHA#${this.checkIn}`;
    }
  }
}
