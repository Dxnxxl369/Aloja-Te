// ======================================================================
// ARCHIVO: base/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La lista de valores fijos de la app: URL del servidor, tiempos, reintentos, nombres.
// PARA QUÉ SIRVE: Cambiar un valor en UN solo lugar, sin buscarlo dentro de la lógica. Es el único archivo que lee variables de entorno.
// SIN ÉL: Los valores quedarían regados dentro del código de cada archivo.
// NO VA AQUÍ: Funciones ni lógica. Solo valores.
// ======================================================================
// Expo solo reemplaza referencias ESTÁTICAS a process.env.EXPO_PUBLIC_*,
// por eso cada variable se escribe completa.

// --- Entorno ----------------------------------------------------------------
// 10.0.2.2 = localhost de tu PC visto desde el emulador de Android.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
// Ruta real de MS-01 (AuthController: POST /api/v1/auth/login), vía Gateway.
export const RUTA_LOGIN = process.env.EXPO_PUBLIC_RUTA_LOGIN ?? '/api/v1/auth/login';
/** Solo demo: permite simular el aviso del banco en la pantalla de pago. */
export const PAGO_SIMULADO_HABILITADO = process.env.EXPO_PUBLIC_PAGO_SIMULADO === '1';

export const IA_LOCAL_HABILITADA = (process.env.EXPO_PUBLIC_IA_LOCAL ?? 'true') === 'true';

/** El agente usa la IA de la nube (Groq) para planear con herramientas; si falla, sigue en modo básico. `false` = siempre modo básico. */
export const AGENTE_LLM_HABILITADO = (process.env.EXPO_PUBLIC_AGENTE_LLM ?? 'true') === 'true';

/** Clave de Groq para que la app llame a la IA directo. Queda DENTRO de la app instalada (no es secreta): solo para demos. Vacía = el agente usa MS-04. */
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

// --- http -------------------------------------------------------------------
export const HTTP = {
  TIMEOUT_MS: 15_000,
  REINTENTOS_GET: 2, // solo GET; un POST nunca se reintenta aquí
  ESPERA_GET_BASE_MS: 500,
  ESPERA_GET_MAX_MS: 5_000,
} as const;

// --- auth -------------------------------------------------------------------
export const CLAVE_SESION = 'alojate.sesion';

// --- db ---------------------------------------------------------------------
export const NOMBRE_BD = 'alojate.db';

// --- offline ----------------------------------------------------------------
// Ojo: el PAGO no se encola offline (la reserva solo se bloquea unos minutos).
export const SYNC = {
  REINTENTOS_MAX: 6,
  ESPERA_BASE_MS: 2_000,
  ESPERA_MAX_MS: 5 * 60_000,
} as const;

// --- ia ---------------------------------------------------------------------
// Modelo local: Qwen3.5-0.8B en GGUF, cuantización Q4_K_M (el más liviano que elegimos).
// Es un repack de la comunidad (AaryanK), no el repositorio oficial de Qwen.
export const MODELO_IA = {
  id: 'qwen3.5-0.8b-q4_k_m',
  url: 'https://huggingface.co/AaryanK/Qwen3.5-0.8B-GGUF/resolve/main/Qwen3.5-0.8B.q4_k_m.gguf',
  archivo: 'Qwen3.5-0.8B.q4_k_m.gguf',
  tamanoBytes: 528_000_000, // la página solo da "528 MB"; sirve para calcular el espacio libre
  md5: '', // PENDIENTE: calcular una vez con el archivo descargado. '' = no verificar
  ramMinimaBytes: 4 * 1024 * 1024 * 1024, // orientativo (artículo), no medido
} as const;

// Cómo corre el modelo (motor llama.rn). Valores iniciales: ajustar tras medir en un celular.
export const IA_RUNTIME = {
  CONTEXTO_TOKENS: 2_048, // memoria de la conversación; más contexto = más RAM
  MAX_TOKENS_RESPUESTA: 160, // la respuesta es un JSON corto
  TEMPERATURA: 0.2, // baja: queremos extraer datos, no inventar
  // Capas en GPU. Android = 0 (solo CPU, lo seguro); iOS = 99 (en iOS solo se soporta Metal).
  CAPAS_GPU_ANDROID: 0,
  CAPAS_GPU_IOS: 99,
} as const;
