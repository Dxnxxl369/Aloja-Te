// ======================================================================
// ARCHIVO: pagos/domain/modelos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Qué es un pago para la app: lo que se pide pagar (SolicitudPago), el QR y el pago resultante.
// PARA QUÉ SIRVE: Un vocabulario propio, independiente de MS-03.
// SIN ÉL: La UI usaría el JSON crudo de Laravel (`qrSimpleData`, `cargoServicio`…).
// NO VA AQUÍ: Funciones ni red. Los DTO viven en data/modelos.ts.
// ======================================================================

import type { ESTADOS_PAGO } from '../constantes';

export type EstadoPago = (typeof ESTADOS_PAGO)[number];

export interface DatosAnfitrionPago {
  id: string;
  nombreCompleto: string;
  bancoNombre: string;
  numeroCuentaBancaria: string;
  qrUrl: string | null;
}

/** Lo necesario para pagar una reserva. Lo arma quien tiene la reserva (el feature reservas no se importa aquí). */
export interface SolicitudPago {
  reservaId: string;
  anfitrionId: string;
  /** Total de alojamiento de la reserva (importeTotal); MS-03 le suma el cargo de servicio. */
  subtotal: number;
  /** Hasta cuándo sigue bloqueada la reserva (epoch ms). null si no corre plazo. */
  reservaBloqueadaHasta: number | null;
  codigoPromocion?: string;
}

export interface QrPago {
  alias: string;
  banco: string;
  monto: number;
  moneda: string;
  glosa: string;
  /** Texto que se dibuja como código QR. */
  cadena: string;
  expiraEnSegundos: number;
}

export interface Comprobante {
  id: string;
  tipo: string;
  numero: string;
}

export interface Pago {
  id: string;
  reservaId: string;
  subtotal: number;
  descuento: number;
  cargoServicio: number;
  total: number;
  moneda: string;
  estado: EstadoPago;
  /** null cuando MS-03 responde una repetición del pago (solo trae el QR al crearlo). */
  qr: QrPago | null;
  anfitrion?: DatosAnfitrionPago | null;
  comprobantes: Comprobante[];
}
