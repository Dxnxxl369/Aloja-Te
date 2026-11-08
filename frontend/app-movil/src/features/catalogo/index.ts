// ======================================================================
// ARCHIVO: catalogo/index.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La puerta del feature catálogo y el ÚNICO archivo que conoce domain, data y presentacion a la vez.
// PARA QUÉ SIRVE: Arma el repositorio real, se lo da a los casos y expone solo lo que otros necesitan.
// SIN ÉL: Nadie ensamblaría las tres capas.
// NO VA AQUÍ: Lógica. Solo conectar.
// ======================================================================

import type { Api } from '../../core';
import { crearRepositorioCatalogo } from './data/repositorio';
import { crearCasosCatalogo } from './domain/casos';
import type { CasosCatalogo } from './domain/interfaces';

export function crearFeatureCatalogo(deps: {
  api: Api;
  guardarCache: (clave: string, valor: unknown, ttlMs?: number) => Promise<void>;
  leerCache: <T>(clave: string) => Promise<T | null>;
}): { casos: CasosCatalogo } {
  return { casos: crearCasosCatalogo({ repo: crearRepositorioCatalogo(deps) }) };
}

export { PantallaExplorar } from './presentacion/pantallas/PantallaExplorar';
export { PantallaDetalleProvisional } from './presentacion/pantallas/PantallaDetalleProvisional';
export type { CasosCatalogo, RepositorioCatalogo } from './domain/interfaces';
export type {
  AlojamientoCatalogo,
  FiltrosLocales,
  FiltrosServidor,
  ResultadoLista,
  TipoPropiedad,
} from './domain/modelos';
