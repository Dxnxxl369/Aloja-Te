// ======================================================================
// ARCHIVO: pagos/domain/casos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las reglas de pagar: no pagar una reserva vencida, no pagar montos inválidos y no crear dos pagos para la misma reserva.
// PARA QUÉ SIRVE: Proteger el pago ANTES de llamar a MS-03.
// SIN ÉL: Se podría iniciar un pago por una reserva que ya expiró.
// NO VA AQUÍ: HTTP ni React.
// ======================================================================
// El pago NO usa la cola offline: sin internet no se puede pagar, y la reserva
// solo queda bloqueada unos minutos.

import type { CasosPagos, RepositorioPagos } from './interfaces';

export function crearCasosPagos(deps: {
  repo: RepositorioPagos;
  ahora?: () => number;
  /** true solo en demo/desarrollo: habilita confirmarSimulado. */
  simulacionHabilitada?: boolean;
}): CasosPagos {
  const { repo } = deps;
  const ahora = deps.ahora ?? Date.now;

  const casos: CasosPagos = {
    async iniciarPago(s) {
      if (!s.reservaId.trim() || !s.anfitrionId.trim()) throw new Error('Falta la reserva o el anfitrión.');
      if (!(s.subtotal > 0)) throw new Error('El monto a pagar debe ser mayor a 0.');
      if (s.reservaBloqueadaHasta !== null && s.reservaBloqueadaHasta <= ahora()) {
        throw new Error('La reserva ya venció: el tiempo para pagar terminó.');
      }
      // Clave estable por reserva: repetir el pago (doble toque, reinicio de la app)
      // devuelve el MISMO pago en MS-03 en vez de crear otro.
      return repo.iniciar(s, `pago:${s.reservaId}`);
    },
    obtenerPago: (id) => repo.obtener(id),
    esFinal: (p) => p.estado !== 'PENDIENTE',
  };

  if (deps.simulacionHabilitada) casos.confirmarSimulado = (id) => repo.confirmarSimulado(id);
  return casos;
}
