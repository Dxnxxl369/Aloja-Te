export interface CrearReservaPayload {
  idCliente: string;
  nombreCliente: string;
  idAnfitrion: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  cantidadHuespedes: number;
  cantidadUnidades: number;
  precioNoche: number;
}

export interface ReservaResponse {
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
  estado: 'PENDIENTE_PAGO' | 'CONFIRMADA' | 'CHECKIN_REALIZADO' | 'COMPLETADA' | 'CANCELADA' | 'EXPIRADA';
  codigoCheckin: string; // 6 digits PIN
  sagaId: string;
  fechaCreacion: string;
}
