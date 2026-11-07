/**
 * Evento que MS-03 (Comercial y Financiero) publica cuando el banco confirma un pago:
 * exchange `alojate.reservas.saga`, routing key `finanzas.pago.confirmado`.
 * Solo se listan los campos que MS-02 usa.
 */
export interface PagoConfirmadoEvento {
  pagoId: string;
  reservaId: string;
  transaccionBancariaRef?: string;
  montoTotal?: number;
  sagaId?: string;
}

/**
 * Qué pasó al reaccionar al pago:
 *  - CONFIRMADA: la reserva pasó a CONFIRMADA.
 *  - YA_CONFIRMADA: el aviso ya se había procesado (mensaje repetido): no se hizo nada.
 *  - REEMBOLSAR: no se puede honrar la reserva (no existe, se canceló o sus fechas se ocuparon): hay que devolver el dinero.
 */
export type ResultadoPagoConfirmado = 'CONFIRMADA' | 'YA_CONFIRMADA' | 'REEMBOLSAR';
