// ======================================================================
// ARCHIVO: reservas/presentacion/texts.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los textos y colores de etiqueta de las reservas que ve el usuario: cómo se llama cada estado, de qué color es y los filtros de la lista.
// PARA QUÉ SIRVE: Que "Mis reservas" y el detalle de la reserva hablen igual. Antes cada pantalla tenía su copia y ya se habían desviado
//   ("Expirada" en un lado y "Expirada (no se pagó a tiempo)" en el otro; "Completada" gris en la lista y verde en el detalle).
// SIN ÉL: Cambiar un texto obligaba a acordarse de cambiarlo en dos pantallas.
// NO VA AQUÍ: Números del negocio (van en ../constantes.ts) ni lógica (organizarReservas.ts).
// ======================================================================
// Para añadir un estado nuevo: agregarlo a ESTADOS_RESERVA (../constantes.ts) y aquí; TypeScript avisa si falta alguno.

import type { Tono } from '../../../shared/ui/Insignia';
import type { Reserva } from '../domain/modelos';
import type { FiltroReservas } from './organizarReservas';

export const TEXTO_ESTADO: Record<Reserva['estado'], string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  CHECKIN_REALIZADO: 'Check-in realizado',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
  RECHAZADA_COMPENSADA: 'Rechazada',
};

export const TONO_ESTADO: Record<Reserva['estado'], Tono> = {
  PENDIENTE_PAGO: 'aviso',
  CONFIRMADA: 'exito',
  CHECKIN_REALIZADO: 'exito',
  COMPLETADA: 'neutro', // ya pasó: no llama la atención como las activas
  CANCELADA: 'error',
  EXPIRADA: 'error',
  RECHAZADA_COMPENSADA: 'error',
};

/** Las pestañas de filtro de "Mis reservas". */
export const FILTROS: { clave: FiltroReservas; etiqueta: string }[] = [
  { clave: 'TODAS', etiqueta: 'Todas' },
  { clave: 'ACTIVAS', etiqueta: 'Activas' },
  { clave: 'ANTERIORES', etiqueta: 'Anteriores' },
];
