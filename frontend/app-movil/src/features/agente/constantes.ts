// ======================================================================
// ARCHIVO: agente/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Todos los valores fijos del agente: rutas, Groq, límites, ciudades conocidas, palabras de confirmación y el prompt del modelo local.
// PARA QUÉ SIRVE: Ajustar el comportamiento del agente sin tocar su lógica.
// SIN ÉL: Textos y números repartidos por el código.
// NO VA AQUÍ: Lógica ni variables de entorno.
// ======================================================================

import { RUTA_ALOJAMIENTOS } from '../../shared/rutas';
import { DIA_MS, OFFSET_BOLIVIA_MS } from '../../shared/ui/tiempo';

/** La ruta de alojamientos (MS-01) y los tiempos se definen una sola vez en shared y se reexportan aquí. */
export { DIA_MS, OFFSET_BOLIVIA_MS, RUTA_ALOJAMIENTOS };

/**
 * MS-04 (main.py, vía Gateway), solo cuando la app no tiene clave de Groq: un paso del agente con herramientas
 * (Groq decide qué herramienta usar; la app la ejecuta).
 *   POST { sistema, mensajes, herramientas } -> { texto, llamadas: [{ id, nombre, argumentos }] }   (503 si Groq no responde)
 */
export const RUTA_IA_AGENTE_TURNO = '/api/v1/ia/agente/turno';

/** Groq directo desde la app (cuando hay clave en EXPO_PUBLIC_GROQ_API_KEY). Modelos con herramientas, en orden de preferencia. */
export const GROQ = {
  URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODELS: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
  /** Cada intento debe caber antes del corte general de la app (15 s). */
  TIMEOUT_MS: 12_000,
  /** Si el fallo es pasajero (límite por minuto, llamada mal armada, error del servidor) se repite UNA vez en el mismo modelo antes de pasar al otro. */
  ATTEMPTS_PER_MODEL: 2,
  /** Solo se espera si Groq pide esperar poco; si pide más, se pasa al otro modelo. */
  RETRY_MAX_WAIT_MS: 5_000,
  RETRY_MARGIN_MS: 300,
  RETRY_SERVER_MS: 500,
  TEMPERATURE: 0.2,
  MAX_TOKENS: 700,
  /** Solo los modelos gpt-oss lo aceptan: respuestas rápidas porque el plan es corto. */
  REASONING_EFFORT: 'low',
  REASONING_MODEL_PREFIX: 'openai/gpt-oss',
} as const;

/** Lo que las herramientas de consulta le devuelven a la IA (se recorta para gastar poco y limitar texto ajeno). */
export const TOOL_LIMITS = {
  /** Descripción y políticas las escribe el anfitrión: se cortan a este largo. */
  FREE_TEXT_MAX_CHARS: 600,
  SERVICES_MAX: 20,
  /** Reservas recientes que ve la IA. */
  BOOKINGS_MAX: 5,
} as const;

/**
 * Palabras que, si aparecen en el mensaje del usuario, impiden que la IA confirme o cancele por su cuenta
 * (duda, negación o cambio). Ya normalizado: sin tildes y en minúsculas. En ese caso solo sirve el "sí" claro de siempre.
 */
export const DOUBT_PATTERN = /\b(no|nada|nunca|cambi\w*|espera\w*|pero|mejor|otra|otro|antes|duda\w*|quiza\w*|tal vez|primero)\b/;

/**
 * Palabras que cuentan como un "sí" cuando la IA confirma o cancela por su cuenta: sin al menos una, el mensaje no es una
 * respuesta afirmativa (por ejemplo "somos 2" no lo es). Ya normalizadas (sin tildes, minúsculas).
 */
export const AFFIRM_WORDS = [
  'si', 'sii', 'ok', 'okay', 'dale', 'confirmo', 'confirma', 'confirmalo', 'confirmala', 'correcto', 'de acuerdo', 'listo', 'adelante',
  'claro', 'perfecto', 'vale', 'hazla', 'hazlo', 'reserva', 'reservala', 'reservalo', 'procede', 'de una', 'bueno', 'esta bien', 'cancelala', 'cancelalo',
] as const;

/** Agente con herramientas: cuántos pasos (consultas a Groq) como máximo por mensaje del usuario y cuántos mensajes recientes ve. */
export const AGENT_LLM = {
  MAX_STEPS: 4,
  HISTORY_MESSAGES: 12,
  /** Tras fallar la IA de la nube, el modo básico atiende solo este tiempo antes de volver a intentarla (así no se espera el corte en cada mensaje). */
  COOLDOWN_MS: 30_000,
} as const;

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
