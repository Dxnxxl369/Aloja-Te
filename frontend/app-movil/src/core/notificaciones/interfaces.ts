// ======================================================================
// ARCHIVO: core/notificaciones/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El contrato de las notificaciones: dejar programados unos avisos y enterarse de cuándo el usuario toca uno.
// PARA QUÉ SIRVE: Hoy son avisos locales (funcionan en Expo Go); si más adelante hay notificaciones push desde el servidor,
//   se escribe otra implementación sin tocar los features.
// SIN ÉL: Los features dependerían de expo-notifications directamente.
// NO VA AQUÍ: Cuándo avisar ni qué texto poner.
// ======================================================================

import type { AvisoLocal } from './modelos';

export type DatosAviso = Record<string, string>;

export interface Notificador {
  /**
   * Deja programados exactamente estos avisos entre los que empiezan con `prefijo`: cancela los que ya no hacen falta
   * y crea los que faltan. Los que ya existen no se vuelven a crear. Nunca lanza error: si no hay permiso o algo falla, no avisa.
   */
  sincronizar(prefijo: string, avisos: AvisoLocal[]): Promise<void>;
  /** Envía una notificación push inmediata en el dispositivo. */
  enviarInmediato(titulo: string, cuerpo: string, datos?: DatosAviso): Promise<void>;
  /** Llama a `escuchador` cada vez que el usuario toca un aviso. Devuelve la función para dejar de escuchar. */
  alTocar(escuchador: (datos: DatosAviso) => void): () => void;
  /** El aviso que abrió la app desde cero (si el usuario la abrió tocando uno), o null. */
  avisoQueAbrioLaApp(): Promise<DatosAviso | null>;
}
