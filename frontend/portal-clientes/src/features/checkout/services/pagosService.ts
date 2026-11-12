import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { IniciarPagoPayload, PagoResponseData } from '../types/checkout.types';

export const pagosService = {
  async iniciarPago(payload: IniciarPagoPayload): Promise<PagoResponseData> {
    const response = await httpClient.post<PagoResponseData>(ENDPOINTS.FINANZAS.PAGOS, payload);
    return response.data;
  },

  async confirmarPagoWebhook(pagoId: string, transaccionBancariaRef?: string, datosFactura?: any): Promise<any> {
    const response = await httpClient.post(ENDPOINTS.FINANZAS.WEBHOOK_BNB, {
      pagoId,
      transaccionBancariaRef: transaccionBancariaRef || `TRX-${Date.now()}`,
      metodoPago: datosFactura?.metodoPago || 'QR_SIMPLE_BNB',
      ...datosFactura
    });
    return response.data;
  },

  async validarPromocion(codigo: string): Promise<any> {
    const response = await httpClient.get(ENDPOINTS.FINANZAS.PROMOCION(codigo));
    return response.data;
  },

  async procesarReembolso(reservaId: string, monto?: number, motivo?: string): Promise<any> {
    const response = await httpClient.post(ENDPOINTS.FINANZAS.REEMBOLSAR(reservaId), {
      monto,
      motivo: motivo || 'Cancelación de reserva y devolución al cliente',
    });
    return response.data;
  }
};
