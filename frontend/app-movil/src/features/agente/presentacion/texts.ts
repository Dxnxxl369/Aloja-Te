// ======================================================================
// ARCHIVO: agente/presentacion/texts.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los textos cortos del chat del agente: qué dice mientras trabaja y las etiquetas de las opciones.
// PARA QUÉ SIRVE: Tener las frases en un solo lugar, fuera del código de la pantalla.
// SIN ÉL: Las frases estarían dentro de PantallaAgente.
// NO VA AQUÍ: Números ni reglas (van en ../constantes.ts) ni lógica.
// ======================================================================

import type { PasoId } from '../domain/modelos';

/** Qué dice el chat mientras el agente trabaja en cada paso. */
export const ACTIVIDAD: Partial<Record<PasoId, string>> = {
  ENTENDER: 'Entendiendo tu pedido',
  BUSCAR: 'Buscando alojamientos',
  VERIFICAR: 'Verificando disponibilidad',
  RESERVAR: 'Creando la reserva',
};

/** Lo que dice el chat cuando no hay un paso conocido en curso. */
export const ACTIVIDAD_GENERICA = 'Trabajando en tu pedido';

/** Etiquetas que se ponen sobre las tarjetas de opciones. */
export const ETIQUETA_OPCION = {
  RECOMENDADA: 'Recomendada',
  ECONOMICA: 'Económico',
  ESPACIOSA: 'Espacioso',
} as const;
