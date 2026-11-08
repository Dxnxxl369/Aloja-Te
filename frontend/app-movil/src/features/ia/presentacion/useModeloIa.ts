// ======================================================================
// ARCHIVO: ia/presentacion/useModeloIa.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Un hook con lo que hace la pantalla "Agente inteligente": descargar, activar y borrar la IA del celular, con el avance y los errores.
// PARA QUÉ SIRVE: Que la ruta solo conecte la pantalla y no tenga estas reglas adentro (estaban en navegacion.tsx).
// SIN ÉL: La descarga y el manejo de errores seguirían mezclados con la navegación.
// NO VA AQUÍ: Cómo se descarga o se carga el modelo (es core/ia) ni el dibujo (es PantallaModeloIa).
// ======================================================================
// Los errores técnicos de la librería no se le muestran al usuario: se registran en consola y se le dice qué hacer (texts.ts).

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MODELO_IA, modeloLocal, useEstadoModelo } from '../../../core';
import { IA_MESSAGES } from './texts';

const BYTES_PER_MB = 1_000_000;

function logFailure(e: unknown): void {
  console.warn('IA local:', e instanceof Error ? e.message : e);
}

export function useModeloIa() {
  const state = useEstadoModelo();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Al abrir la pantalla se revisa si ya está descargada.
  useEffect(() => {
    void modeloLocal.refrescar().catch(() => undefined);
  }, []);

  const download = async () => {
    setError(null);
    setProgress(0);
    try {
      await modeloLocal.descargar(setProgress);
    } catch (e) {
      logFailure(e);
      setError(IA_MESSAGES.DOWNLOAD_FAILED);
    }
  };

  const activate = async () => {
    setError(null);
    try {
      await modeloLocal.cargar();
    } catch (e) {
      logFailure(e);
      setError(IA_MESSAGES.ACTIVATE_FAILED);
    }
  };

  /** Pide confirmación y, si el usuario acepta, borra la descarga para liberar espacio. */
  const remove = () =>
    Alert.alert(IA_MESSAGES.DELETE_TITLE, IA_MESSAGES.DELETE_BODY, [
      { text: IA_MESSAGES.CANCEL, style: 'cancel' },
      {
        text: IA_MESSAGES.DELETE,
        style: 'destructive',
        onPress: () => {
          setError(null);
          modeloLocal.eliminar().catch((e) => {
            logFailure(e);
            setError(IA_MESSAGES.DELETE_FAILED);
          });
        },
      },
    ]);

  return {
    state,
    /** Avance de la descarga, de 0 a 1. */
    progress,
    error,
    sizeMb: Math.round(MODELO_IA.tamanoBytes / BYTES_PER_MB),
    download: () => void download(),
    activate: () => void activate(),
    remove,
  };
}
