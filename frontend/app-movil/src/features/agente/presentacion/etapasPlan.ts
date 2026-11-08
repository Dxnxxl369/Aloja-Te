// ======================================================================
// ARCHIVO: agente/presentacion/etapasPlan.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Agrupa los 8 pasos internos del plan en 4 etapas que el usuario entiende (Pedido, Opciones, Confirmar, Pagar) y dice en cuál está.
// PARA QUÉ SIRVE: Que el avance se vea como cuatro puntos conectados en vez de ocho tramos sin nombre.
// SIN ÉL: La pantalla mezclaría esta regla con el dibujo.
// NO VA AQUÍ: Dibujo (es PlanPuntos.tsx) ni la lógica de los pasos (es domain/plan.ts).
// ======================================================================
// Etapa → pasos internos:
//   Pedido     = Entender tu pedido + Completar los datos
//   Opciones   = Buscar alojamientos + Elegir una opción
//   Confirmar  = Verificar disponibilidad + Confirmar contigo
//   Pagar      = Crear la reserva + Pagar
// La etapa ACTUAL es la que contiene el paso en curso (o fallido, o el primero pendiente). Las anteriores están HECHAS.

import type { Paso, PasoId } from '../domain/modelos';

export type EstadoEtapa = 'HECHA' | 'ACTUAL' | 'PENDIENTE' | 'FALLIDA';

export interface Etapa {
  titulo: string;
  estado: EstadoEtapa;
}

const ETAPAS: { titulo: string; pasos: PasoId[] }[] = [
  { titulo: 'Pedido', pasos: ['ENTENDER', 'COMPLETAR_DATOS'] },
  { titulo: 'Opciones', pasos: ['BUSCAR', 'ELEGIR'] },
  { titulo: 'Confirmar', pasos: ['VERIFICAR', 'CONFIRMAR'] },
  { titulo: 'Pagar', pasos: ['RESERVAR', 'PAGAR'] },
];

/** El paso que se está haciendo ahora: en curso, fallido, o el primero pendiente. undefined si todo está hecho. */
export function pasoVisible(plan: Paso[]): Paso | undefined {
  return plan.find((p) => p.estado === 'EN_CURSO') ?? plan.find((p) => p.estado === 'FALLIDO') ?? plan.find((p) => p.estado === 'PENDIENTE');
}

export function etapasDelPlan(plan: Paso[]): Etapa[] {
  const actual = pasoVisible(plan);
  const indiceActual = actual ? ETAPAS.findIndex((e) => e.pasos.includes(actual.id)) : -1;
  return ETAPAS.map((e, i) => {
    const suyos = plan.filter((p) => e.pasos.includes(p.id));
    let estado: EstadoEtapa;
    if (suyos.some((p) => p.estado === 'FALLIDO')) estado = 'FALLIDA';
    else if (!actual) estado = 'HECHA'; // todos los pasos hechos
    else if (i < indiceActual) estado = 'HECHA';
    else if (i === indiceActual) estado = 'ACTUAL';
    else estado = 'PENDIENTE';
    return { titulo: e.titulo, estado };
  });
}
