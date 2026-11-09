// ======================================================================
// ARCHIVO: catalogo/presentacion/useDetalle.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El hook de la ficha: pide el detalle de un alojamiento y avisa si está cargando o falló.
// PARA QUÉ SIRVE: La pantalla pinta de inmediato lo que ya sabe (de la tarjeta) y completa cuando llega el resto.
// SIN ÉL: La pantalla mezclaría la carga con el diseño.
// NO VA AQUÍ: Diseño ni reglas.
// ======================================================================

import { useCallback, useEffect, useState } from 'react';
import type { CasosCatalogo } from '../domain/interfaces';
import type { DetalleAlojamiento } from '../domain/modelos';

export function useDetalle(casos: CasosCatalogo, id: string) {
  const [detalle, setDetalle] = useState<DetalleAlojamiento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    casos.obtenerDetalle(id).then(
      (d) => {
        if (!vivo) return;
        setDetalle(d);
        setError(null);
        setCargando(false);
      },
      (e: unknown) => {
        if (!vivo) return;
        setError(e instanceof Error ? e.message : 'No se pudo cargar el alojamiento.');
        setCargando(false);
      },
    );
    return () => {
      vivo = false;
    };
  }, [casos, id, intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return { detalle, cargando, error, recargar };
}
