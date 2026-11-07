// ======================================================================
// ARCHIVO: base/store.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Un timbre: avisa a las pantallas cuando algo cambia (volvió la red, avanzó una descarga).
// PARA QUÉ SIRVE: Evitar que 4 archivos tengan su propio timbre copiado, y que React se actualice solo.
// SIN ÉL: Habría que repetir el mismo código en auth, cola, sincronizador y modeloLocal.
// NO VA AQUÍ: Lógica de negocio. Solo avisos y estado observable.
// ======================================================================
// Única implementación de "avisar a quien escucha". La usan cola, auth,
// sincronizador y modeloLocal; antes cada uno tenía su propia copia.

import { useSyncExternalStore } from 'react';
import type { StoreLectura } from './interfaces';

/** Aviso sin datos: "algo cambió, vuelve a mirar". */
export function crearEmisor() {
  const oyentes = new Set<() => void>();
  return {
    emitir: (): void => oyentes.forEach((f) => f()),
    suscribir(callback: () => void): () => void {
      oyentes.add(callback);
      return () => {
        oyentes.delete(callback);
      };
    },
  };
}

/** Estado observable: get / set parcial / suscribir. */
export function crearStore<T extends object>(inicial: T) {
  let valor = inicial;
  const emisor = crearEmisor();
  return {
    get: (): T => valor,
    set(parcial: Partial<T>): void {
      valor = { ...valor, ...parcial };
      emisor.emitir();
    },
    suscribir: emisor.suscribir,
  };
}

/** Hook genérico: sirve para el estado de sync, del modelo de IA o de lo que venga. */
export function useStore<T>(store: StoreLectura<T>): T {
  return useSyncExternalStore(store.suscribir, store.get);
}
