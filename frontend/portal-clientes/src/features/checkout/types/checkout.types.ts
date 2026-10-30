export interface IniciarPagoPayload {
  reservaId: string;
  anfitrionId: string;
  subtotal: number;
  codigoPromocion?: string;
  metodoPago?: string;
}

export interface PagoQRData {
  alias: string;
  banco: string;
  moneda: string;
  monto: number;
  glosa: string;
  qrRawString: string;
  expiraEnSegundos: number;
}

export interface ComprobanteFactura {
  comprobanteId: string;
  tipo: string;
  numero: string;
  fechaEmision: string;
}

export interface PagoResponseData {
  pagoId: string;
  reservaId: string;
  anfitrionId: string;
  promocionId: string | null;
  subtotalAlojamiento: number;
  descuento: number;
  cargoServicio: number;
  montoTotal: number;
  moneda: string;
  estado: string;
  idempotencyKey: string;
  sagaId: string;
  qrSimpleData?: PagoQRData;
  comprobantes: ComprobanteFactura[];
  fechaCreacion: string;
}
