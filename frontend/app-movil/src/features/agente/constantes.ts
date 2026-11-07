// ======================================================================
// ARCHIVO: agente/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Todos los valores fijos del agente: rutas, límites, ciudades conocidas, palabras de confirmación y el prompt del modelo.
// PARA QUÉ SIRVE: Ajustar el comportamiento del agente sin tocar su lógica.
// SIN ÉL: Textos y números repartidos por el código.
// NO VA AQUÍ: Lógica ni variables de entorno.
// ======================================================================

/** MS-01 vía Gateway (AlojamientoController: GET /api/v1/alojamientos?ciudad&precioMax&minHuespedes). */
export const RUTA_ALOJAMIENTOS = '/api/v1/alojamientos';

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
