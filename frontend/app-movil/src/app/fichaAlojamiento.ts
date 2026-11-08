// ======================================================================
// ARCHIVO: app/fichaAlojamiento.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Consigue la foto y el lugar de un alojamiento a partir de su id (MS-01).
// PARA QUÉ SIRVE: La reserva (MS-02) solo guarda el título; la pantalla de reserva muestra la portada con esto.
// SIN ÉL: La portada de la reserva sería siempre un ícono.
// NO VA AQUÍ: Pantallas ni reglas de reserva. Cuando exista el feature de catálogo, esto pasa allí.
// ======================================================================
// Si no hay red usa lo último guardado; si tampoco hay, devuelve null y la pantalla sigue sin foto.

import type { Api } from '../core';
import type { FichaAlojamiento } from '../features/reservas';
import { RUTA_ALOJAMIENTOS } from '../shared/rutas';
import { DIA_MS } from '../shared/ui/tiempo';

const PREFIJO_CACHE = 'ficha-alojamiento:';

/** Solo los campos que se usan de AlojamientoDto.java. */
interface AlojamientoFichaDto {
  direccion?: string | null;
  ciudad?: string | null;
  estadoPublicacion?: string;
  fotografias?: { url: string; orden?: number }[];
}

function fichaDesdeDto(d: AlojamientoFichaDto): FichaAlojamiento {
  const primeraFoto = [...(d.fotografias ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0];
  const ubicacion = [d.direccion, d.ciudad].filter((t): t is string => !!t && t.trim().length > 0).join(', ');
  return {
    fotoUrl: primeraFoto?.url,
    ubicacion: ubicacion || undefined,
    verificado: d.estadoPublicacion === 'PUBLICADO',
  };
}

export function crearFichaAlojamiento(deps: {
  api: Api;
  guardarCache: (clave: string, valor: unknown, ttlMs?: number) => Promise<void>;
  leerCache: <T>(clave: string) => Promise<T | null>;
}): (alojamientoId: string) => Promise<FichaAlojamiento | null> {
  const { api, guardarCache, leerCache } = deps;
  return async (alojamientoId) => {
    const clave = PREFIJO_CACHE + alojamientoId;
    try {
      const dto = await api.get<AlojamientoFichaDto>(`${RUTA_ALOJAMIENTOS}/${alojamientoId}`);
      await guardarCache(clave, dto, DIA_MS);
      return fichaDesdeDto(dto);
    } catch {
      const guardado = await leerCache<AlojamientoFichaDto>(clave).catch(() => null);
      return guardado ? fichaDesdeDto(guardado) : null;
    }
  };
}
