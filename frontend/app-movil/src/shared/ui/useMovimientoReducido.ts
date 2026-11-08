// ======================================================================
// ARCHIVO: shared/ui/useMovimientoReducido.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Un hook que dice si la persona pidió "reducir movimiento" en los ajustes de su celular.
// PARA QUÉ SIRVE: Que las animaciones que se repiten (esqueletos, puntos de "escribiendo") se queden quietas si así lo pidió.
// SIN ÉL: Cada animación repetiría esta consulta.
// NO VA AQUÍ: Ninguna animación: solo responde sí o no.
// ======================================================================

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true si el sistema pide menos movimiento. Se actualiza si la persona lo cambia con la app abierta. */
export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (v) => vivo && setReducido(v),
      () => undefined,
    );
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);
    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);
  return reducido;
}
