import { Injectable } from '@nestjs/common';

export type ResultadoReembolso = 'REEMBOLSADO' | 'YA_REEMBOLSADO' | 'SIN_PAGO';

/**
 * Compensación de la Saga: pide a MS-03 devolver el dinero de una reserva que no se puede honrar.
 * Pasa por el API Gateway (GATEWAY_URL, por defecto http://localhost:8080).
 *
 *   POST {GATEWAY_URL}/api/v1/pagos/{reservaId}/reembolsar
 *     200 -> se reembolsó            409 -> el pago ya no es reembolsable (p. ej. ya se devolvió)
 *     404 -> no hay pago de esa reserva    otro/red -> se lanza un error para reintentar
 */
@Injectable()
export class PagosHttpClient {
  async reembolsar(reservaId: string, motivo: string): Promise<ResultadoReembolso> {
    const base = (process.env.GATEWAY_URL || 'http://localhost:8080').replace(/\/$/, '');
    const respuesta = await fetch(`${base}/api/v1/pagos/${encodeURIComponent(reservaId)}/reembolsar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Correlation-Id': reservaId },
      body: JSON.stringify({ motivo }),
      signal: AbortSignal.timeout(8_000),
    });

    if (respuesta.ok) return 'REEMBOLSADO';
    if (respuesta.status === 409) return 'YA_REEMBOLSADO';
    if (respuesta.status === 404) return 'SIN_PAGO';
    throw new Error(`MS-03 respondió ${respuesta.status} al reembolsar la reserva ${reservaId}`);
  }
}
