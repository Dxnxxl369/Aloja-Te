// ======================================================================
// ARCHIVO: agente/domain/plan.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las piezas puras del plan: los pasos, qué datos faltan, cómo se mezclan los datos nuevos y cómo se entiende "la 2" o "sí".
// PARA QUÉ SIRVE: Que el comportamiento del agente sea predecible y fácil de probar: sin IA, sin red.
// SIN ÉL: Esa lógica quedaría enredada dentro del flujo de casos.ts.
// NO VA AQUÍ: Llamadas a servicios (eso es casos.ts).
// ======================================================================

import { NUMEROS_EN_PALABRAS, PALABRAS_NO, PALABRAS_SI } from '../constantes';
import type { Criterios, EstadoPaso, Intencion, Opcion, Paso, PasoId } from './modelos';

const TITULOS: Record<PasoId, string> = {
  ENTENDER: 'Entender tu pedido',
  COMPLETAR_DATOS: 'Completar los datos que faltan',
  BUSCAR: 'Buscar alojamientos',
  ELEGIR: 'Elegir una opción',
  VERIFICAR: 'Verificar disponibilidad',
  CONFIRMAR: 'Confirmar contigo',
  RESERVAR: 'Crear la reserva',
  PAGAR: 'Pagar (lo haces tú)',
};
const ORDEN: PasoId[] = ['ENTENDER', 'COMPLETAR_DATOS', 'BUSCAR', 'ELEGIR', 'VERIFICAR', 'CONFIRMAR', 'RESERVAR', 'PAGAR'];

export function planInicial(): Paso[] {
  return ORDEN.map((id) => ({ id, titulo: TITULOS[id], estado: 'PENDIENTE' as EstadoPaso }));
}

/** Devuelve un plan nuevo con un paso cambiado. */
export function marcar(plan: Paso[], id: PasoId, estado: EstadoPaso, nota?: string): Paso[] {
  return plan.map((p) => {
    if (p.id !== id) return p;
    const { nota: _anterior, ...sinNota } = p;
    return nota ? { ...sinNota, estado, nota } : { ...sinNota, estado };
  });
}

/** Vuelve a PENDIENTE todos los pasos desde `desde` en adelante (para retomar el plan). */
export function reiniciarDesde(plan: Paso[], desde: PasoId): Paso[] {
  const i = ORDEN.indexOf(desde);
  return plan.map((p) => {
    if (ORDEN.indexOf(p.id) < i) return p;
    const { nota: _n, ...sinNota } = p;
    return { ...sinNota, estado: 'PENDIENTE' as EstadoPaso };
  });
}

export type Falta = 'ciudad' | 'fechas' | 'entrada' | 'huespedes';

/** Qué datos faltan, en el orden en que se preguntan. */
export function faltantes(c: Criterios): Falta[] {
  const f: Falta[] = [];
  if (!c.ciudad) f.push('ciudad');
  if (!c.checkIn) f.push('fechas');
  else if (!c.checkOut) f.push('entrada'); // ya hay entrada, falta la salida
  if (!c.huespedes) f.push('huespedes');
  return f;
}

export function preguntaPara(falta: Falta): string {
  switch (falta) {
    case 'ciudad':
      return '¿En qué ciudad quieres alojarte?';
    case 'fechas':
      return '¿Qué fechas necesitas? Dime entrada y salida (por ejemplo: del 12 al 15 de diciembre).';
    case 'entrada':
      return '¿Qué día es tu salida?';
    case 'huespedes':
      return '¿Cuántas personas son?';
  }
}

/** Mezcla los datos nuevos sobre los que ya había; lo nuevo gana. */
export function mezclar(actual: Criterios, nuevo: Intencion): Criterios {
  const resultado: Criterios = { ...actual };
  for (const clave of Object.keys(nuevo) as (keyof Criterios)[]) {
    const v = nuevo[clave];
    if (v !== undefined) (resultado as Record<string, unknown>)[clave] = v;
  }
  return resultado;
}

export function haySoloDatosNuevos(nuevo: Intencion): boolean {
  return Object.values(nuevo).some((v) => v !== undefined);
}

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "2", "la 2", "opción 2", "la segunda", "quiero la tercera" -> índice 0-based. Un mensaje largo NO cuenta como elección. */
export function interpretarEleccion(texto: string, cantidad: number): number | null {
  const m = normalizar(texto).match(
    /^(?:(?:quiero|elijo|me quedo con|dame)\s+)?(?:la\s+|el\s+)?(?:opcion\s+|numero\s+)?(\d|primer[oa]|segund[oa]|tercer[oa]|uno|dos|tres)$/,
  );
  if (!m?.[1]) return null;
  const t = m[1];
  const n = /^\d$/.test(t)
    ? Number(t)
    : t.startsWith('primer')
      ? 1
      : t.startsWith('segund')
        ? 2
        : t.startsWith('tercer')
          ? 3
          : (NUMEROS_EN_PALABRAS[t] ?? 0);
  return n >= 1 && n <= cantidad ? n - 1 : null;
}

/**
 * Conservador a propósito: un "sí" falso crearía una reserva, así que solo se acepta el "sí"
 * claro (solo, o "sí" + una palabra afirmativa). "no sé" NO es un no ni un sí: se vuelve a preguntar.
 */
export function interpretarConfirmacion(texto: string): 'SI' | 'NO' | null {
  const t = normalizar(texto);
  if ((PALABRAS_NO as readonly string[]).includes(t) || /^no (quiero|gracias|deseo|me interesa|todavia|aun)\b/.test(t)) return 'NO';
  const sinSi = t.replace(/^si /, '');
  if ((PALABRAS_SI as readonly string[]).includes(t) || (t.startsWith('si ') && (PALABRAS_SI as readonly string[]).includes(sinSi))) return 'SI';
  return null;
}

export function descripcionOpcion(o: Opcion, n: number): string {
  return `${n}. ${o.titulo} – ${o.unidadNombre} (${o.ciudad}) · hasta ${o.capacidad} personas · Bs ${o.precioNoche.toFixed(2)} por noche`;
}

/**
 * Qué opción recomienda el agente y por qué. Solo usa datos reales de las opciones:
 * mejor calificación, luego menor precio. Devuelve null si hay una sola opción o ningún motivo claro.
 */
export function recomendar(opciones: Opcion[], c: Criterios): { indice: number; motivo: string } | null {
  if (opciones.length < 2) return null;
  const conNota = opciones.filter((o) => typeof o.calificacion === 'number');
  const mejorNota = conNota.length ? Math.max(...conNota.map((o) => o.calificacion as number)) : null;
  const barata = Math.min(...opciones.map((o) => o.precioNoche));

  let indice = 0;
  let mejor = -Infinity;
  opciones.forEach((o, i) => {
    // La nota pesa más que el precio: 1 estrella de diferencia vale lo mismo que 200 Bs por noche.
    const puntos = (o.calificacion ?? 0) * 200 - o.precioNoche;
    if (puntos > mejor) {
      mejor = puntos;
      indice = i;
    }
  });

  const o = opciones[indice] as Opcion;
  const motivos: string[] = [];
  if (mejorNota !== null && o.calificacion === mejorNota && conNota.length > 1) {
    motivos.push(`tiene la mejor calificación (${mejorNota.toFixed(1)})`);
  }
  if (o.precioNoche === barata) motivos.push('es la opción más económica');
  if (c.presupuestoMaxNoche && o.precioNoche <= c.presupuestoMaxNoche) {
    motivos.push(`entra en tu presupuesto de Bs ${c.presupuestoMaxNoche}`);
  }
  if (motivos.length === 0) return null;
  return { indice, motivo: `Te recomiendo ${o.titulo} porque ${motivos.join(' y ')}.` };
}
