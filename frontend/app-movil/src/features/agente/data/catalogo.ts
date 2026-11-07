// ======================================================================
// ARCHIVO: agente/data/catalogo.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Busca alojamientos reales en MS-01.
// PARA QUÉ SIRVE: Dar al agente opciones verdaderas (con los IDs que MS-02 necesita para reservar).
// SIN ÉL: El agente no tendría qué ofrecer.
// NO VA AQUÍ: Elegir ni ordenar opciones (eso es del plan).
// ======================================================================

import type { Api } from '../../../core';
import { RUTA_ALOJAMIENTOS } from '../constantes';
import type { CatalogoAlojamientos } from '../domain/interfaces';
import { opcionesDesdeAlojamientos } from './mapeadores';
import type { AlojamientoDto, UnidadDto } from './modelos';

export function crearCatalogoMs01(deps: { api: Api }): CatalogoAlojamientos {
  const { api } = deps;
  return {
    async buscar(c) {
      const alojamientos = await api.get<AlojamientoDto[]>(RUTA_ALOJAMIENTOS, {
        query: { ciudad: c.ciudad, precioMax: c.presupuestoMaxNoche, minHuespedes: c.huespedes },
      });
      // Si la lista no trae las unidades, se piden aparte (solo a los que no las traen).
      const extra: Record<string, UnidadDto[]> = {};
      await Promise.all(
        alojamientos
          .filter((a) => !a.unidades?.length)
          .map(async (a) => {
            extra[a.idAlojamiento] = await api.get<UnidadDto[]>(`${RUTA_ALOJAMIENTOS}/${a.idAlojamiento}/unidades`);
          }),
      );
      return opcionesDesdeAlojamientos(alojamientos, extra, c);
    },
  };
}
