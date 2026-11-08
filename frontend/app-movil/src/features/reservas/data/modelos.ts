// ======================================================================
// ARCHIVO: reservas/data/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los DTO de MS-02: la forma CRUDA de lo que se manda y se recibe (camelCase, tal cual el backend).
// PARA QUÉ SIRVE: Que solo esta carpeta conozca los nombres del backend. Si MS-02 cambia, se arregla aquí y en mapeadores.ts.
// SIN ÉL: Los nombres del backend se filtrarían a todo el código.
// NO VA AQUÍ: Modelos de dominio. Un DTO nunca sale de data/.
// ======================================================================
// Fuente: ms-reservas-estadias (crear-reserva.dto.ts, reserva-response.dto.ts).

export interface CrearReservaDto {
  idCliente: string;
  nombreCliente: string;
  idAnfitrion: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;
  checkIn: string;
  checkOut: string;
  cantidadHuespedes: number;
  precioNoche: number;
  /** MS-02 lo lee del CUERPO (no del header Idempotency-Key). */
  idempotencyKey: string;
}

export interface ReservaDto {
  idReserva: string;
  idCliente: string;
  idAnfitrion: string;
  idAlojamiento: string;
  tituloAlojamiento: string;
  idUnidad: string;
  nombreUnidad: string;
  checkIn: string;
  checkOut: string;
  nochesEstadia: number;
  cantidadHuespedes: number;
  precioNoche: number;
  importeTotal: number;
  moneda: string;
  estado: string;
  codigoCheckin: string;
  /** Epoch en SEGUNDOS. Solo mientras está PENDIENTE_PAGO. */
  ttl?: number;
}

export interface DisponibilidadDto {
  disponible: boolean;
  fechasBloqueadas: string[];
}
