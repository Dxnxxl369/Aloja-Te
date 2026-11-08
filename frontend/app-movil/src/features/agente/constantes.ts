// ======================================================================
// ARCHIVO: agente/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Todos los valores fijos del agente: rutas, límites, ciudades conocidas, palabras de confirmación y el prompt del modelo.
// PARA QUÉ SIRVE: Ajustar el comportamiento del agente sin tocar su lógica.
// SIN ÉL: Textos y números repartidos por el código.
// NO VA AQUÍ: Lógica ni variables de entorno.
// ======================================================================

import { RUTA_ALOJAMIENTOS } from '../../shared/rutas';
import { DIA_MS, OFFSET_BOLIVIA_MS } from '../../shared/ui/tiempo';

/** La ruta de alojamientos (MS-01) y los tiempos se definen una sola vez en shared y se reexportan aquí. */
export { DIA_MS, OFFSET_BOLIVIA_MS, RUTA_ALOJAMIENTOS };

/**
 * PROPUESTA, NO EXISTE AÚN: MS-04 hoy solo tiene /health. Contrato pedido:
 *   POST { texto, criterios, hoy } -> { intencion: { ciudad?, checkIn?, checkOut?, huespedes?, presupuestoMaxNoche? } }
 */
export const RUTA_IA_INTENCION = '/api/v1/ia/agente/intencion';

/** Cuántas opciones se le muestran al usuario. */
export const MAX_OPCIONES = 3;

export const CIUDADES = [
  'Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Tarija', 'Oruro', 'Potosí', 'Trinidad',
  'Cobija', 'Copacabana', 'Uyuni', 'Samaipata', 'Rurrenabaque', 'Coroico',
] as const;

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

/** Textos normalizados (minúsculas, sin tildes ni signos). */
export const PALABRAS_SI = ['si', 'sii', 'ok', 'dale', 'confirmo', 'confirmar', 'correcto', 'de acuerdo', 'listo', 'adelante', 'reservar', 'claro', 'quiero', 'por favor'] as const;
export const PALABRAS_NO = ['no', 'cancelar', 'cancela', 'cambiar', 'otra', 'ninguna', 'mejor no'] as const;

export const NUMEROS_EN_PALABRAS: Record<string, number> = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
};

export const LIMITES = { HUESPEDES_MAX: 20, PRESUPUESTO_MAX: 100_000, CIUDAD_MAX_CHARS: 60 } as const;

/** `{HOY}` se reemplaza por la fecha actual (YYYY-MM-DD) para que el modelo entienda "mañana". */
export const PROMPT_INTENCION =
  'Eres un extractor de datos para reservar alojamiento en Bolivia. Hoy es {HOY}. ' +
  'Del mensaje del usuario extrae SOLO un objeto JSON con estas claves, todas opcionales: ' +
  'ciudad (texto), checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), huespedes (entero), ' +
  'presupuestoMaxNoche (número en bolivianos por noche). Omite lo que el usuario no diga. ' +
  'Responde únicamente el JSON, sin explicaciones.';

/**
 * Forma exacta que debe tener la respuesta del modelo local (el motor lo convierte en gramática:
 * el modelo no puede escribir nada fuera de esta forma). Todas las claves son opcionales.
 * Asegura la FORMA, no la verdad: `intencionDesdeObjeto` valida cada valor igualmente.
 */
export const ESQUEMA_INTENCION = {
  type: 'object',
  properties: {
    ciudad: { type: 'string' },
    checkIn: { type: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' },
    checkOut: { type: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' },
    huespedes: { type: 'integer' },
    presupuestoMaxNoche: { type: 'number' },
  },
  additionalProperties: false,
} as const;

/** Cada cuánto se vuelve a preguntar si una reserva en la cola offline ya se envió. */
export const POLL_COLA_MS = 3_000;

/** Respuestas rápidas que se ofrecen bajo la pregunta del agente. */
export const CIUDADES_RAPIDAS = CIUDADES.slice(0, 4);
export const PERSONAS_RAPIDAS = [1, 2, 3, 4];

/** Los tres puntos que laten mientras el agente trabaja ("escribiendo"): cuántos son, cada cuánto sube uno, cuánto tarda en subir y las dos opacidades. */
export const TYPING_DOTS = { COUNT: 3, STEP_MS: 160, RISE_MS: 320, OPACITY_LOW: 0.3, OPACITY_STILL: 0.6 } as const;

/** Cuántos servicios se ven en la tarjeta de una opción antes del "+N". */
export const MAX_OPTION_SERVICES = 3;
