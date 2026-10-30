import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { CrearReservaPayload, ReservaResponse } from '../types/reserva.types';

export const reservasService = {
  async crearReserva(payload: CrearReservaPayload): Promise<ReservaResponse> {
    const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CREAR, payload);
    return response.data;
  },

  async obtenerReserva(id: string): Promise<ReservaResponse> {
    const response = await httpClient.get<ReservaResponse>(ENDPOINTS.RESERVAS.OBTENER(id));
    return response.data;
  },

  async listarTodas(): Promise<ReservaResponse[]> {
    const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.LISTAR_TODAS);
    return response.data;
  },

  async listarPorAnfitrion(anfitrionId: string): Promise<ReservaResponse[]> {
    const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.ANFITRION_HISTORIAL(anfitrionId));
    return response.data;
  },

  async listarPorCliente(clienteId: string): Promise<ReservaResponse[]> {
    const response = await httpClient.get<ReservaResponse[]>(ENDPOINTS.RESERVAS.CLIENTE_HISTORIAL(clienteId));
    return response.data;
  },

  async confirmarPagoSaga(idReserva: string, pagoId: string, transaccionBancariaRef: string): Promise<ReservaResponse> {
    const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CONFIRMAR_PAGO(idReserva), {
      pagoId,
      metodoPago: 'QR_SIMPLE_BNB',
      transaccionBancariaRef,
    });
    return response.data;
  },

  async realizarCheckIn(idReserva: string, codigoCheckin: string, notasHuesped?: string): Promise<ReservaResponse> {
    const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CHECK_IN(idReserva), {
      codigoCheckin,
      notasHuesped: notasHuesped || 'Check-in verificado presencialmente.',
    });
    return response.data;
  },

  async finalizarCheckOut(idReserva: string): Promise<ReservaResponse> {
    const response = await httpClient.post<ReservaResponse>(ENDPOINTS.RESERVAS.CHECK_OUT(idReserva), {});
    return response.data;
  }
};
