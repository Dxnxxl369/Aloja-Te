export interface CrearReservaPayload {
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
  cantidadHuespedes: number;
  cantidadUnidades: number;
  precioNoche: number;
}

export interface ReservaResponse {
  idReserva: string;
  idCliente: string;
  nombreCliente: string;
  idAnfitrion: string;
  nombreAnfitrion?: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;
  checkIn: string;
  checkOut: string;
  horaEstimadaLlegada?: string;
  nochesEstadia: number;
  cantidadHuespedes: number;
  cantidadUnidades: number;
  precioNoche: number;
  importeTotal: number;
  moneda: string;
  estado: 'PENDIENTE_PAGO' | 'CONFIRMADA' | 'CHECKIN_REALIZADO' | 'CHECK_IN' | 'COMPLETADA' | 'CANCELADA' | 'EXPIRADA';
  codigoCheckin: string; // PIN de 6 dígitos
  sagaId: string;
  fechaCreacion: string;
}

export interface RangoOcupado {
  idReserva: string;
  checkIn: string;
  checkOut: string;
  horaEntrada: string;
  horaSalida: string;
  nombreCliente?: string;
  estado: string;
}
