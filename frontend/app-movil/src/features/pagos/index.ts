// ======================================================================
// ARCHIVO: pagos/index.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La puerta del feature y el ÚNICO archivo que conoce domain, data y presentacion a la vez.
// PARA QUÉ SIRVE: Arma el repositorio real, se lo da a los casos y expone lo que otros necesitan.
// SIN ÉL: Nadie ensamblaría las tres capas.
// NO VA AQUÍ: Lógica. Solo conectar.
// ======================================================================

import type { Api } from '../../core';
import { crearRepositorioPagos } from './data/repositorio';
import { crearCasosPagos } from './domain/casos';
import type { CasosPagos } from './domain/interfaces';

export function crearFeaturePagos(deps: {
  api: Api;
  ahora?: () => number;
  simulacionHabilitada?: boolean;
}): { casos: CasosPagos } {
  return {
    casos: crearCasosPagos({
      repo: crearRepositorioPagos({ api: deps.api }),
      ahora: deps.ahora,
      simulacionHabilitada: deps.simulacionHabilitada,
    }),
  };
}

export { PantallaPago } from './presentacion/pantallas/PantallaPago';
export type { CasosPagos, RepositorioPagos } from './domain/interfaces';
export type { DatosAnfitrionPago, EstadoPago, Pago, QrPago, SolicitudPago } from './domain/modelos';
