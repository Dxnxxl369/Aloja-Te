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
}

export type Disponible = 'SI' | 'NO' | 'DESCONOCIDA';

export type ResultadoReservar =
  | { tipo: 'CREADA'; reservaId: string; total: number }
  | { tipo: 'EN_COLA'; clave: string };
