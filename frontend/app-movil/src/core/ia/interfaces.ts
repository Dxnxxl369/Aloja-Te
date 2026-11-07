// ======================================================================
// ARCHIVO: ia/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Dos contratos: el del motor de inferencia (RuntimeIA) y el del administrador del modelo (ModeloLocal).
// PARA QUÉ SIRVE: Cambiar de motor (llama.rn u otro) sin tocar el resto, y que los features usen ModeloLocal sin conocer la implementación.
// SIN ÉL: La app quedaría atada a una librería de IA concreta.
// NO VA AQUÍ: El motor real (está en ia/runtimeLlama.ts y se conecta en di/composicion.ts).
// ======================================================================

import type { StoreLectura } from '../base/interfaces';
import type { EstadoModelo, OpcionesGeneracion } from './modelos';

/** Contrato del motor de inferencia. */
export interface RuntimeIA {
  cargar(rutaArchivo: string): Promise<void>;
  generar(prompt: string, opciones?: OpcionesGeneracion): Promise<string>;
  liberar(): Promise<void>;
}

/** Ciclo de vida del modelo: NO_DESCARGADO -> DESCARGANDO -> LISTO -> CARGADO. */
export interface ModeloLocal {
  estado(): EstadoModelo;
  /** Solo lectura: se consume con useEstadoModelo(). */
  store: StoreLectura<{ estado: EstadoModelo }>;
  puedeUsar(): Promise<boolean>;
  /** Mirar el disco y fijar el estado inicial. Llamar al abrir el chat. */
  refrescar(): Promise<EstadoModelo>;
  descargar(onProgreso?: (fraccion: number) => void): Promise<void>;
  /** Carga perezosa: solo cuando el usuario abre el chat o la búsqueda. */
  cargar(): Promise<void>;
  generar(prompt: string, opciones?: OpcionesGeneracion): Promise<string>;
  /** Liberar memoria al salir del chat. */
  liberar(): Promise<void>;
}
