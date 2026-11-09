// ======================================================================
// ARCHIVO: ia/presentacion/useIaLocal.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Un hook que carga la inteligencia del agente en el celular al abrir la pestaña del agente y la libera al salir.
// PARA QUÉ SIRVE: Que el agente use la IA local sin gastar memoria mientras el usuario explora otras pantallas.
// SIN ÉL: La IA descargada nunca se activaría sola.
// NO VA AQUÍ: Descargar ni borrar (es useModeloIa) ni la carga en sí (es core/ia).
// ======================================================================
// Si el celular no la soporta o falla, no pasa nada: el agente sigue con la nube o con sus reglas simples.

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { modeloLocal } from '../../../core';

/** Se carga al enfocar la pantalla (solo si está descargada) y se libera al salir de ella. */
export function useIaLocal(): void {
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const state = await modeloLocal.refrescar();
          if (alive && state === 'LISTO') await modeloLocal.cargar();
        } catch (e) {
          console.warn('IA local no disponible, el agente usará la nube o las reglas', e instanceof Error ? e.message : e);
        }
      })();
      return () => {
        alive = false;
        void modeloLocal.liberar().catch(() => undefined);
      };
    }, []),
  );
}
