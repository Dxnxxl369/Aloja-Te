// ======================================================================
// ARCHIVO: agente/index.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La puerta del feature y el ÚNICO archivo que conoce domain, data y presentacion a la vez.
// PARA QUÉ SIRVE: Elige la IA que planea con herramientas (Groq) y, de respaldo, el modo básico (IA local o reglas); arma el catálogo y los puentes a reservas y catálogo.
// SIN ÉL: Nadie ensamblaría las tres capas.
// NO VA AQUÍ: Lógica. Solo conectar.
// ======================================================================

import type { Api, ModeloLocal } from '../../core';
import type { CasosReservas } from '../reservas';
import { crearReservadorDesdeCasos } from './data/adaptadorReservas';
import { createBookingsSource, createDetailsSource } from './data/adaptadorConsultas';
import type { DetailsLike } from './data/adaptadorConsultas';
import { crearCatalogoMs01 } from './data/catalogo';
import { crearMotorCompuesto, crearMotorLocal, crearMotorReglas } from './data/motores';
import { OFFSET_BOLIVIA_MS } from './constantes';
import { createGroqPlanner, createRemotePlanner } from './data/planner';
import { crearCasosAgente } from './domain/casos';
import { createLlmAgentCases } from './domain/llmCases';
import type { CasosAgente } from './domain/interfaces';
import type { Cliente } from './domain/modelos';

export function crearFeatureAgente(deps: {
  api: Api;
  reservas: CasosReservas;
  obtenerCliente: () => Promise<Cliente>;
  /** Si no se pasa, el modo básico entiende solo con reglas simples. */
  modeloLocal?: ModeloLocal;
  ahora?: () => number;
  /** La IA de la nube (Groq) planea con herramientas; si no responde, atiende el modo básico. `false` = siempre modo básico. Por defecto, activado. */
  llmHabilitado?: boolean;
  /** Con clave, la app llama a Groq directo; sin ella, lo hace a través de MS-04. */
  groqApiKey?: string;
  /** La ficha completa de un alojamiento (la entrega quien conecta los features). Sin ella, la IA no tiene la herramienta de fichas. */
  obtenerDetalle?: (alojamientoId: string) => Promise<DetailsLike>;
}): { casos: CasosAgente } {
  const motor = crearMotorCompuesto({
    reglas: crearMotorReglas({ ahora: deps.ahora }),
    ...(deps.modeloLocal ? { local: crearMotorLocal({ modelo: deps.modeloLocal, ahora: deps.ahora }) } : {}),
  });
  const catalogo = crearCatalogoMs01({ api: deps.api });
  const reservador = crearReservadorDesdeCasos({ casos: deps.reservas, obtenerCliente: deps.obtenerCliente });
  // Modo básico: el plan fijo, que entiende con la IA local (si está cargada) o con reglas.
  const basico = crearCasosAgente({ motor, catalogo, reservador });
  if (deps.llmHabilitado === false) return { casos: basico };
  // Modo normal: la IA de la nube decide con las herramientas; si no responde, cae al modo básico.
  const ahora = deps.ahora ?? Date.now;
  return {
    casos: createLlmAgentCases({
      planner: deps.groqApiKey ? createGroqPlanner({ apiKey: deps.groqApiKey }) : createRemotePlanner({ api: deps.api }),
      catalogo,
      reservador,
      bookings: createBookingsSource({ casos: deps.reservas, obtenerCliente: deps.obtenerCliente }),
      ...(deps.obtenerDetalle ? { details: createDetailsSource({ fetchDetails: deps.obtenerDetalle }) } : {}),
      fallback: basico,
      today: () => new Date(ahora() + OFFSET_BOLIVIA_MS).toISOString().slice(0, 10),
      now: ahora,
    }),
  };
}

export { PantallaAgente } from './presentacion/pantallas/PantallaAgente';
export { IndicadorModoIa } from './presentacion/componentes/IndicadorModoIa';
export type { CasosAgente } from './domain/interfaces';
export type { Cliente, ContextoAlojamiento, EstadoAgente, Opcion } from './domain/modelos';
