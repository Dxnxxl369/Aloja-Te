// ======================================================================
// ARCHIVO: agente/index.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La puerta del feature y el ÚNICO archivo que conoce domain, data y presentacion a la vez.
// PARA QUÉ SIRVE: Elige los motores (local, nube, reglas), arma el catálogo y el puente a reservas, y se los da al plan.
// SIN ÉL: Nadie ensamblaría las tres capas.
// NO VA AQUÍ: Lógica. Solo conectar.
// ======================================================================

import type { Api, ModeloLocal } from '../../core';
import type { CasosReservas } from '../reservas';
import { crearReservadorDesdeCasos } from './data/adaptadorReservas';
import { crearCatalogoMs01 } from './data/catalogo';
import { crearMotorCompuesto, crearMotorLocal, crearMotorReglas, crearMotorRemoto } from './data/motores';
import { crearCasosAgente } from './domain/casos';
import type { CasosAgente } from './domain/interfaces';
import type { Cliente } from './domain/modelos';

export function crearFeatureAgente(deps: {
  api: Api;
  reservas: CasosReservas;
  obtenerCliente: () => Promise<Cliente>;
  /** Si no se pasa, el agente usa solo la nube y las reglas. */
  modeloLocal?: ModeloLocal;
  ahora?: () => number;
}): { casos: CasosAgente } {
  const motor = crearMotorCompuesto({
    reglas: crearMotorReglas({ ahora: deps.ahora }),
    remoto: crearMotorRemoto({ api: deps.api, ahora: deps.ahora }),
    ...(deps.modeloLocal ? { local: crearMotorLocal({ modelo: deps.modeloLocal, ahora: deps.ahora }) } : {}),
  });
  return {
    casos: crearCasosAgente({
      motor,
      catalogo: crearCatalogoMs01({ api: deps.api }),
      reservador: crearReservadorDesdeCasos({ casos: deps.reservas, obtenerCliente: deps.obtenerCliente }),
    }),
  };
}

export { PantallaAgente } from './presentacion/pantallas/PantallaAgente';
export type { CasosAgente } from './domain/interfaces';
export type { Cliente, ContextoAlojamiento, EstadoAgente, Opcion } from './domain/modelos';
