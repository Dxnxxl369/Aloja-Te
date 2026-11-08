// ======================================================================
// ARCHIVO: agente/presentacion/conversacion.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Funciones puras que preparan lo que se muestra en el chat del agente: limpiar el texto de las opciones, contar noches, escribir la hora y poner las etiquetas "Recomendada", "Económico", "Espacioso".
// PARA QUÉ SIRVE: Sacar de la pantalla la lógica que no dibuja, para que la pantalla quede corta y esto se pueda probar sin React.
// SIN ÉL: PantallaAgente tendría cinco funciones sueltas dentro (estaban ahí).
// NO VA AQUÍ: Dibujo, estado de React (useHoras.ts) ni reglas del plan (domain/plan.ts).
// ======================================================================

import { DIA_MS } from '../constantes';
import type { Opcion } from '../domain/modelos';
import { ETIQUETA_OPCION } from './texts';

/** Misma forma que `descripcionOpcion` (domain/plan.ts): sirve para no repetir la lista que ya se dibuja como tarjetas. */
const LINEA_OPCION = /^\d+\. .+ · hasta \d+ personas · Bs \d+(\.\d+)? por noche$/;

/** Quita del mensaje las líneas "1. Hotel… · Bs 480 por noche", porque las opciones ya se ven como tarjetas. */
export function quitarListaDeOpciones(texto: string): string {
  return texto
    .split('\n')
    .filter((l) => !LINEA_OPCION.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Noches entre dos fechas 'YYYY-MM-DD'; null si falta alguna o la salida no es posterior. */
export function nochesEntre(entrada?: string, salida?: string): number | null {
  if (!entrada || !salida) return null;
  const n = (Date.parse(`${salida}T00:00:00Z`) - Date.parse(`${entrada}T00:00:00Z`)) / DIA_MS;
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : null;
}

/** 1700000000000 -> "5:13 PM" (hora local del celular, formato de 12 horas). */
export function formatearHora(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Las etiquetas de una opción: "Recomendada" para la sugerida, y "Económico" o "Espacioso" al comparar con las demás. */
export function insigniasDe(indice: number, o: Opcion, todas: Opcion[], indiceRecomendada: number | null): string[] {
  const etiquetas: string[] = [];
  if (indice === indiceRecomendada) etiquetas.push(ETIQUETA_OPCION.RECOMENDADA);
  if (todas.length >= 2) {
    const masBarata = Math.min(...todas.map((x) => x.precioNoche));
    const mayorCapacidad = Math.max(...todas.map((x) => x.capacidad));
    const menorCapacidad = Math.min(...todas.map((x) => x.capacidad));
    if (o.precioNoche === masBarata) etiquetas.push(ETIQUETA_OPCION.ECONOMICA);
    else if (o.capacidad === mayorCapacidad && mayorCapacidad > menorCapacidad) etiquetas.push(ETIQUETA_OPCION.ESPACIOSA);
  }
  return etiquetas;
}
