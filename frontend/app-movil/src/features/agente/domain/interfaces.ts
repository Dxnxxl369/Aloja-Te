// ======================================================================
// ARCHIVO: agente/domain/interfaces.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Los contratos de lo que el agente necesita del mundo (MotorLenguaje, CatalogoAlojamientos, Reservador) y de lo que ofrece (CasosAgente).
// PARA QUÉ SIRVE: El agente funciona igual con la IA de la nube que planea (Groq), la IA local o las reglas, y se prueba sin red.
// SIN ÉL: El agente quedaría atado a un modelo o a un backend concreto.
// NO VA AQUÍ: Implementaciones (están en data/).
// ======================================================================

import type {
  AccommodationDetails,
  BookingSummary,
  ContextoAlojamiento,
  Criterios,
  Disponible,
  EstadoAgente,
  Intencion,
  Opcion,
  PlannerMessage,
  PlannerReply,
  ResultadoReservar,
  ToolSpec,
} from './modelos';

/** La IA que PLANEA: dado el contexto y las herramientas, decide qué hacer (responder o pedir herramientas). Nunca ejecuta nada. */
export interface Planner {
  turn(input: { system: string; messages: PlannerMessage[]; tools: ToolSpec[] }): Promise<PlannerReply>;
}

/** Entiende un mensaje y devuelve los datos que encuentra. NUNCA ejecuta acciones. */
export interface MotorLenguaje {
  extraerIntencion(texto: string, criteriosActuales: Criterios): Promise<Intencion>;
}

export interface CatalogoAlojamientos {
  buscar(criterios: Criterios): Promise<Opcion[]>;
}

/** Lo que el agente puede hacer con reservas (se conecta al feature reservas). */
export interface Reservador {
  verificarDisponibilidad(unidadId: string, checkIn: string, checkOut: string): Promise<Disponible>;
  reservar(opcion: Opcion, criterios: Required<Pick<Criterios, 'checkIn' | 'checkOut' | 'huespedes'>>): Promise<ResultadoReservar>;
  noches(checkIn: string, checkOut: string): number | null;
  validarFechas(checkIn: string, checkOut: string): string | null;
}

/** De dónde sale la ficha completa de un alojamiento (descripción, políticas, horarios, servicios). */
export interface AccommodationDetailsSource {
  details(accommodationId: string): Promise<AccommodationDetails>;
}

/** Las reservas del usuario que ha iniciado sesión (las más recientes primero) y cancelar una que espera el pago. */
export interface BookingsSource {
  list(): Promise<BookingSummary[]>;
  /** Lanza un Error con mensaje para el usuario si la reserva ya no se puede cancelar. */
  cancel(bookingId: string): Promise<void>;
}

/** Cada operación recibe el estado actual y devuelve el nuevo: no hay estado escondido. */
export interface CasosAgente {
  /** Conversación nueva. Con `contexto`, el agente ya sabe en qué alojamiento se va a reservar. */
  iniciar(contexto?: ContextoAlojamiento): EstadoAgente;
  enviarMensaje(estado: EstadoAgente, texto: string): Promise<EstadoAgente>;
  elegirOpcion(estado: EstadoAgente, indice: number): Promise<EstadoAgente>;
  confirmar(estado: EstadoAgente): Promise<EstadoAgente>;
  rechazar(estado: EstadoAgente): EstadoAgente;
}
