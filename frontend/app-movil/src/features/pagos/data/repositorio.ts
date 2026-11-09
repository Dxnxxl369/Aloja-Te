// ======================================================================
// ARCHIVO: pagos/data/repositorio.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La implementación real de RepositorioPagos: habla con MS-03.
// PARA QUÉ SIRVE: Iniciar el pago con su clave de idempotencia y consultarlo. Recuerda el QR (MS-03 solo lo devuelve al crear el pago).
// SIN ÉL: Los casos no tendrían de dónde sacar el pago.
// NO VA AQUÍ: Reglas de negocio ni cola offline (pagar exige red).
// ======================================================================
// OJO (contrato con MS-03): al repetir POST /pagos con la misma clave, MS-03 devuelve el
// pago SIN `qrSimpleData`. Por eso se guarda el QR en memoria por pagoId. Si la app se
// reinicia, el QR se pierde: conviene pedir a MS-03 que lo incluya también en la repetición
// y en GET /pagos/:id.

import type { Api } from '../../../core';
import { RUTA_PAGOS } from '../constantes';
import type { DatosAnfitrionPago, QrPago } from '../domain/modelos';
import type { RepositorioPagos } from '../domain/interfaces';
import { dtoDesdeSolicitud, pagoDesdeDto, qrDesdeDto } from './mapeadores';
import type { ConfirmacionDto, PagoDto } from './modelos';

export function crearRepositorioPagos(deps: { api: Api }): RepositorioPagos {
  const { api } = deps;
  const qrPorPago = new Map<string, QrPago>();

  function aDominio(dto: PagoDto) {
    if (dto.qrSimpleData) qrPorPago.set(dto.pagoId, qrDesdeDto(dto.qrSimpleData));
    return pagoDesdeDto(dto, qrPorPago.get(dto.pagoId) ?? null);
  }

  return {
    async iniciar(solicitud, idempotencyKey) {
      const dto = await api.post<PagoDto>(RUTA_PAGOS, dtoDesdeSolicitud(solicitud, idempotencyKey), {
        idempotencyKey,
      });
      return aDominio(dto);
    },

    async obtener(pagoId) {
      return aDominio(await api.get<PagoDto>(`${RUTA_PAGOS}/${pagoId}`));
    },

    async obtenerDatosAnfitrion(anfitrionId: string): Promise<DatosAnfitrionPago> {
      try {
        const u = await api.get<any>(`/api/v1/usuarios/${anfitrionId}`);
        const nombre = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Anfitrión Aloja-Te';
        return {
          id: u.idUsuario ?? anfitrionId,
          nombreCompleto: nombre,
          bancoNombre: u.bancoNombre || 'Banco Nacional de Bolivia (BNB)',
          numeroCuentaBancaria: u.numeroCuentaBancaria || '2000123456789',
          qrUrl: u.qr ?? null,
        };
      } catch {
        return {
          id: anfitrionId,
          nombreCompleto: 'Anfitrión Aloja-Te',
          bancoNombre: 'Banco Nacional de Bolivia (BNB)',
          numeroCuentaBancaria: '2000123456789',
          qrUrl: null,
        };
      }
    },

    async confirmarSimulado(pagoId, reservaId) {
      try {
        const resp = await api.post<ConfirmacionDto>(`${RUTA_PAGOS}/${pagoId}/confirmar`, { pagoId });
        // También notificar a reservas si se conoce reservaId
        if (reservaId) {
          await api.post(`/api/v1/reservas/${reservaId}/confirmar-pago`, { idTransaccion: pagoId }).catch(() => {});
        }
        return aDominio(resp.pago);
      } catch (err) {
        // Fallback demo directo si MS-03 responde con detalle
        if (reservaId) {
          await api.post(`/api/v1/reservas/${reservaId}/confirmar-pago`, { idTransaccion: pagoId }).catch(() => {});
        }
        const actual = await api.get<PagoDto>(`${RUTA_PAGOS}/${pagoId}`).catch(() => null);
        if (actual) {
          actual.estado = 'COMPLETADO';
          return aDominio(actual);
        }
        throw err;
      }
    },
  };
}
