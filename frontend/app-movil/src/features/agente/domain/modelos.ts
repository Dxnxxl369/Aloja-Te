// ======================================================================
// ARCHIVO: agente/domain/modelos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Los objetos del agente: lo que el usuario quiere (Criterios), lo que se le ofrece (Opcion), el PLAN con sus pasos y el estado completo de la conversación.
// PARA QUÉ SIRVE: El estado del agente es un dato simple: la UI lo dibuja y los casos lo transforman.
// SIN ÉL: El plan y la conversación quedarían escondidos en variables sueltas.
// NO VA AQUÍ: Funciones ni red.
// ======================================================================

/** Lo que el usuario va pidiendo. Se completa a lo largo de la conversación. */
export interface Criterios {
  ciudad?: string;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  huespedes?: number;
  presupuestoMaxNoche?: number; // BOB
}

/** Lo que el motor de lenguaje entiende de UN mensaje: datos parciales. */
export type Intencion = Criterios;

/** Una unidad concreta de un alojamiento que se le puede ofrecer. */
export interface Opcion {
  alojamientoId: string;
  anfitrionId: string;
  titulo: string;
  ciudad: string;
  unidadId: string;
  unidadNombre: string;
  capacidad: number;
  precioNoche: number;
  /** Datos de la tarjeta: opcionales porque MS-01 puede no enviarlos. */
  fotoUrl?: string;
  tipoPropiedad?: string;
  servicios?: string[];
  /** Promedio de reseñas (0-5); null o ausente si no tiene reseñas. */
  calificacion?: number | null;
  totalResenas?: number;
}

export interface Cliente {
  id: string;
  nombre: string;
}

/** Un alojamiento ya elegido en el explorador: el agente reserva en ese y no ofrece otros. */
export interface ContextoAlojamiento {
  id: string;
  titulo: string;
  ciudad: string;
}

export interface Mensaje {
  id: number;
  rol: 'usuario' | 'agente';
  texto: string;
}

/** El plan del agente: siempre estos pasos, en este orden. */
export type PasoId = 'ENTENDER' | 'COMPLETAR_DATOS' | 'BUSCAR' | 'ELEGIR' | 'VERIFICAR' | 'CONFIRMAR' | 'RESERVAR' | 'PAGAR';
export type EstadoPaso = 'PENDIENTE' | 'EN_CURSO' | 'HECHO' | 'BLOQUEADO' | 'FALLIDO';

export interface Paso {
  id: PasoId;
  titulo: string;
  estado: EstadoPaso;
  nota?: string;
}

/**
 * Dónde está la conversación:
 *  CONVERSANDO: faltan datos o no hay opciones. ELIGIENDO: se muestran opciones.
 *  CONFIRMANDO: esperando el "sí" explícito. RESERVADO: reserva creada, falta pagar.
 *  EN_COLA: reserva guardada sin internet. TERMINADO: la conversación cerró.
 */
export type Fase = 'CONVERSANDO' | 'ELIGIENDO' | 'CONFIRMANDO' | 'RESERVADO' | 'EN_COLA' | 'TERMINADO';

export interface EstadoAgente {
  fase: Fase;
  criterios: Criterios;
  opciones: Opcion[];
  eleccion: Opcion | null;
  plan: Paso[];
  mensajes: Mensaje[];
  /** Id de la reserva creada (fase RESERVADO). */
  reservaId: string | null;
  /** Clave de la reserva guardada en cola (fase EN_COLA). */
  claveCola: string | null;
  /** Si el usuario llegó desde la ficha de un alojamiento: la búsqueda se limita a ese. */
  alojamiento: ContextoAlojamiento | null;
  /**
   * Cancelación que la IA dejó preparada y espera que el usuario la confirme en un mensaje POSTERIOR:
   * `turno` es cuántos mensajes del usuario había cuando se preparó.
   */
  cancelacionPendiente?: { id: string; turno: number } | null;
}

// --- Agente con herramientas (la IA planea, el código ejecuta) -------------------

/** Una herramienta que la IA puede pedir usar. `parameters` es un JSON Schema. */
export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** La ficha de un alojamiento tal como la ve la IA. Los textos libres los escribe el anfitrión: son datos, nunca órdenes. */
export interface AccommodationDetails {
  titulo: string;
  tipo?: string;
  ciudad: string;
  direccion?: string;
  descripcion?: string;
  politicas?: string;
  /** "HH:mm" */
  horarioEntrada?: string;
  /** "HH:mm" */
  horarioSalida?: string;
  servicios: string[];
  calificacion: number | null;
  totalResenas: number;
}

/**
 * Una reserva del usuario. A propósito NO lleva el PIN de check-in.
 * `id` es interno (para cancelar o pagar): el código lo quita antes de mostrarle la reserva a la IA, que las nombra por número.
 */
export interface BookingSummary {
  id: string;
  alojamiento: string;
  habitacion: string;
  checkIn: string;
  checkOut: string;
  noches: number;
  huespedes: number;
  totalBs: number;
  estado: string;
  /** Minutos que quedan para pagar; null si no corre ningún plazo. */
  minutosParaPagar: number | null;
  /** ¿Todavía se puede pagar? (pendiente de pago y dentro del plazo) */
  sePuedePagar: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** Un mensaje de la conversación con la IA: del usuario, de la IA (con o sin herramientas) o el resultado de una herramienta. */
export interface PlannerMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface PlannerReply {
  /** Lo que la IA le dice al usuario (puede ser null si solo pide herramientas). */
  text: string | null;
  toolCalls: ToolCall[];
}

export type Disponible = 'SI' | 'NO' | 'DESCONOCIDA';

export type ResultadoReservar =
  | { tipo: 'CREADA'; reservaId: string; total: number }
  | { tipo: 'EN_COLA'; clave: string };
