// ======================================================================
// ARCHIVO: offline/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los contratos de la cola y del sincronizador.
// PARA QUÉ SIRVE: Los features ven solo `Cola` (registrar, encolar, ver fallidas); el sincronizador ve `ColaInterna` (además marcar estados). Así un feature no puede tocar el estado de las operaciones.
// SIN ÉL: Los features quedarían atados a la implementación y verían métodos que no deben usar.
// NO VA AQUÍ: Código que guarde o envíe operaciones.
// ======================================================================

import type { StoreLectura } from '../base/interfaces';
import type { EstadoSync, Manejador, Operacion } from './modelos';

/** Lo que pueden usar los features. */
export interface Cola {
  registrarManejador(tipo: string, manejador: Manejador): void;
  /** Guarda la operación y devuelve su clave de idempotencia. */
  encolar(tipo: string, payload: unknown): Promise<{ id: string; idempotencyKey: string }>;
  /** Operaciones que el servidor rechazó, para mostrarlas al usuario. */
  fallidas(): Promise<Operacion[]>;
  suscribir(callback: () => void): () => void;
}

/** Lo que además necesita el sincronizador. */
export interface ColaInterna extends Cola {
  manejadorDe(tipo: string): Manejador | undefined;
  /** La más antigua que ya puede enviarse. */
  siguiente(): Promise<Operacion | null>;
  marcarEnviando(id: string): Promise<void>;
  marcarCompletada(id: string): Promise<void>;
  /** Vuelve a PENDIENTE para intentar más tarde. */
  reprogramar(id: string, intentos: number, proximoIntento: number, error: string): Promise<void>;
  /** Error definitivo (validación, conflicto…): no se reintenta. */
  marcarFallida(id: string, error: string): Promise<void>;
  /** Al arrancar: lo que quedó ENVIANDO porque se cerró la app vuelve a PENDIENTE. */
  recuperarEnviando(): Promise<void>;
  contarPendientes(): Promise<number>;
  /** Cuándo vence la próxima operación en espera (para programar el reintento). */
  proximoVencimiento(): Promise<number | null>;
}

export interface Sincronizador {
  /** Llamar una vez al arrancar la app. */
  iniciar(): Promise<void>;
  detener(): void;
  /** Forzar un intento ahora (botón "Reintentar"). */
  sincronizarAhora(): Promise<void>;
  /** Solo lectura: se consume con useEstadoSync(). */
  estado: StoreLectura<EstadoSync>;
}
