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
import type { AlojamientoDto, ResumenValoracionesDto, UnidadDto } from './modelos';

/** Máximo de alojamientos a los que se les pide la calificación (una llamada por cada uno). */
const MAX_RESUMENES = 6;

export function crearCatalogoMs01(deps: { api: Api }): CatalogoAlojamientos {
  const { api } = deps;
  return {
    async buscar(c) {
      const alojamientos = await api.get<AlojamientoDto[]>(RUTA_ALOJAMIENTOS, {
        // `departamento` vacío a propósito: MS-01 falla con "lower(bytea)" si llega nulo.
        query: { ciudad: c.ciudad, departamento: '', precioMax: c.presupuestoMaxNoche, minHuespedes: c.huespedes },
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

      // Calificaciones: si una falla, esa tarjeta simplemente no muestra estrellas.
      const resumenes: Record<string, ResumenValoracionesDto | null> = {};
      await Promise.all(
        alojamientos.slice(0, MAX_RESUMENES).map(async (a) => {
          try {
            resumenes[a.idAlojamiento] = await api.get<ResumenValoracionesDto>(
              `${RUTA_ALOJAMIENTOS}/${a.idAlojamiento}/valoraciones/resumen`,
            );
          } catch {
            resumenes[a.idAlojamiento] = null;
          }
        }),
      );

      return opcionesDesdeAlojamientos(alojamientos, extra, c, resumenes);
    },
  };
}
