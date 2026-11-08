// ======================================================================
// ARCHIVO: pagos/data/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los DTO de MS-03: la forma CRUDA de lo que se manda y se recibe (camelCase, tal cual Laravel).
// PARA QUÉ SIRVE: Que solo esta carpeta conozca los nombres del backend.
// SIN ÉL: Los nombres de MS-03 se filtrarían a toda la app.
// NO VA AQUÍ: Modelos de dominio.
// ======================================================================
// Fuente: ms-comercial-financiero (ProcesarPagoDTO.php, PagoResponseDTO.php).

export interface ProcesarPagoDto {
  reservaId: string;
  anfitrionId: string;
  subtotal: number;
  metodoPago: string;
  codigoPromocion?: string;
  idempotencyKey: string;
}

export interface QrSimpleDto {
  alias: string;
  banco: string;
  moneda: string;
  monto: number;
  glosa: string;
  qrRawString: string;
  expiraEnSegundos: number;
}

export interface PagoDto {
  pagoId: string;
  reservaId: string;
  subtotalAlojamiento: number;
  descuento: number;
  cargoServicio: number;
  montoTotal: number;
  moneda: string;
  estado: string;
  qrSimpleData: QrSimpleDto | null;
  comprobantes: { comprobanteId: string; tipo: string; numero: string }[];
}

/** Respuesta de POST /pagos/:id/confirmar: el pago viene dentro de `pago`. */
export interface ConfirmacionDto {
  pago: PagoDto;
}
