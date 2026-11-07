// ======================================================================
// ARCHIVO: ia/modelos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los datos del modelo de IA local: su ficha (URL, tamaño, hash, RAM mínima) y en qué estado está.
// PARA QUÉ SIRVE: Describir qué modelo se usa, en qué punto de su ciclo de vida está y con qué opciones se le pide una respuesta.
// SIN ÉL: La ficha del modelo estaría mezclada con la lógica de descarga.
// NO VA AQUÍ: Funciones. Los valores concretos del modelo van en base/constantes.ts.
// ======================================================================

export interface ModeloCatalogo {
  id: string;
  url: string;
  archivo: string; // nombre local, ej. 'Qwen3.5-0.8B.q4_k_m.gguf'
  tamanoBytes: number;
  md5: string; // '' = no verificar
  ramMinimaBytes: number;
}

/** Opciones por llamada. El motor no sabe de reservas: el feature le pasa su propio esquema. */
export interface OpcionesGeneracion {
  /** Esquema JSON: obliga al modelo a responder SOLO con esa forma. */
  esquemaJson?: object;
  maxTokens?: number;
}

/** Cómo se configura el motor (viene de IA_RUNTIME en base/constantes.ts). */
export interface ConfigRuntime {
  contextoTokens: number;
  maxTokensRespuesta: number;
  temperatura: number;
  capasGpu: number;
}

export type EstadoModelo =
  | 'NO_SOPORTADO'
  | 'NO_DESCARGADO'
  | 'DESCARGANDO'
  | 'LISTO'
  | 'CARGADO'
  | 'ERROR';
