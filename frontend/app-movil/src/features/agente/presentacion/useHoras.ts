// ======================================================================
// ARCHIVO: agente/presentacion/useHoras.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Un hook que recuerda a qué hora apareció cada mensaje del chat.
// PARA QUÉ SIRVE: Mostrar "5:13 PM" bajo cada mensaje; el modelo del agente no guarda la hora.
// SIN ÉL: Los mensajes no tendrían hora.
// NO VA AQUÍ: Escribir la hora (eso es `formatearHora` en conversacion.ts).
// ======================================================================

import { useRef } from 'react';
import type { Mensaje } from '../domain/modelos';

/** Devuelve, por id de mensaje, la hora (en milisegundos) a la que se vio por primera vez. Se borra al empezar una conversación nueva. */
export function useHoras(mensajes: Mensaje[]): Map<number, number> {
  const horas = useRef(new Map<number, number>());
  if (mensajes.length <= 1) horas.current.clear(); // conversación nueva
  for (const m of mensajes) if (!horas.current.has(m.id)) horas.current.set(m.id, Date.now());
  return horas.current;
}
