// ======================================================================
// ARCHIVO: pagos/data/mapeadores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las funciones que traducen entre el DTO de MS-03 y el modelo de la app.
// PARA QUÉ SIRVE: Es la única frontera con los nombres de Laravel (`montoTotal`, `qrRawString`…).
// SIN ÉL: La UI dependería de cómo se llame cada campo en PHP.
// NO VA AQUÍ: Red ni base de datos.
// ======================================================================

import { ESTADOS_PAGO, METODO_PAGO } from '../constantes';
import type { EstadoPago, Pago, QrPago, SolicitudPago } from '../domain/modelos';
import type { PagoDto, ProcesarPagoDto, QrSimpleDto } from './modelos';

export function dtoDesdeSolicitud(s: SolicitudPago, idempotencyKey: string): ProcesarPagoDto {
  return {
    reservaId: s.reservaId,
    anfitrionId: s.anfitrionId,
    subtotal: s.subtotal,
    metodoPago: METODO_PAGO,
    ...(s.codigoPromocion ? { codigoPromocion: s.codigoPromocion } : {}),
    idempotencyKey,
  };
}

function estadoValido(texto: string): EstadoPago {
  if ((ESTADOS_PAGO as readonly string[]).includes(texto)) return texto as EstadoPago;
  throw new Error(`Estado de pago desconocido: ${texto}`);
}

export function qrDesdeDto(d: QrSimpleDto): QrPago {
  return {
    alias: d.alias,
    banco: d.banco,
    monto: d.monto,
    moneda: d.moneda,
    glosa: d.glosa,
    cadena: d.qrRawString,
    expiraEnSegundos: d.expiraEnSegundos,
  };
}

/** `qrRespaldo`: el QR que se recibió al crear el pago, por si esta respuesta ya no lo trae. */
export function pagoDesdeDto(d: PagoDto, qrRespaldo: QrPago | null = null): Pago {
  return {
    id: d.pagoId,
    reservaId: d.reservaId,
    subtotal: d.subtotalAlojamiento,
    descuento: d.descuento,
    cargoServicio: d.cargoServicio,
    total: d.montoTotal,
    moneda: d.moneda,
    estado: estadoValido(d.estado),
    qr: d.qrSimpleData ? qrDesdeDto(d.qrSimpleData) : qrRespaldo,
    comprobantes: (d.comprobantes ?? []).map((c) => ({ id: c.comprobanteId, tipo: c.tipo, numero: c.numero })),
  };
}
