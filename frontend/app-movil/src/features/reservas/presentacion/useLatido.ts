// ======================================================================
// ARCHIVO: reservas/presentacion/useLatido.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Un hook que obliga a la pantalla a dibujarse otra vez cada segundo mientras haga falta.
// PARA QUÉ SIRVE: Que las cuentas regresivas ("Paga en 12:34") avancen solas en la lista de reservas.
// SIN ÉL: El tiempo restante se quedaría congelado hasta tocar algo.
// NO VA AQUÍ: Calcular el tiempo restante (eso es `casos.segundosRestantes`).
// ======================================================================

import { useEffect, useState } from 'react';

/** Hace que la pantalla se vuelva a dibujar cada segundo mientras `activo`. Con `false` no gasta nada. */
export function useLatido(activo: boolean): void {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => setN((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [activo]);
}
