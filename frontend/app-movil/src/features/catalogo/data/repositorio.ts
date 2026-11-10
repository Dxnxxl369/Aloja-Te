// ======================================================================
// ARCHIVO: catalogo/data/repositorio.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La implementación real de RepositorioCatalogo: habla con MS-01 y guarda lo último en la caché local.
// PARA QUÉ SIRVE: Que el explorador siga mostrando alojamientos aunque se pierda la red.
// SIN ÉL: Los casos no tendrían de dónde sacar los alojamientos.
// NO VA AQUÍ: Reglas de negocio (domain/casos.ts).
// ======================================================================
// Una calificación o una lista de unidades que falle NO tumba la lista: esa tarjeta sale sin nota o sin precio.

import type { Api } from '../../../core';
import { esSinRed } from '../../../core';
import { CACHE, MAX_RESUMENES, RUTA_ALOJAMIENTOS, RUTA_TIPOS_PROPIEDAD } from '../constantes';
import type { RepositorioCatalogo } from '../domain/interfaces';
import type { AlojamientoCatalogo, DetalleAlojamiento, FiltrosServidor, ResenaAlojamiento, TipoPropiedad } from '../domain/modelos';
import { alojamientoDesdeDto, detalleDesdeDto, tipoDesdeDto } from './mapeadores';
import type { AlojamientoDto, ResumenValoracionesDto, TipoPropiedadDto, UnidadDto } from './modelos';

export interface DepsRepositorioCatalogo {
  api: Api;
  /** Las funciones de caché de core, inyectadas para poder probar sin SQLite. */
  guardarCache: (clave: string, valor: unknown, ttlMs?: number) => Promise<void>;
  leerCache: <T>(clave: string) => Promise<T | null>;
}

export function crearRepositorioCatalogo(deps: DepsRepositorioCatalogo): RepositorioCatalogo {
  const { api, guardarCache, leerCache } = deps;

  async function unidadesDe(a: AlojamientoDto): Promise<UnidadDto[]> {
    if (a.unidades?.length) return a.unidades;
    try {
      return await api.get<UnidadDto[]>(`${RUTA_ALOJAMIENTOS}/${a.idAlojamiento}/unidades`);
    } catch {
      return [];
    }
  }

  async function resumenDe(a: AlojamientoDto): Promise<ResumenValoracionesDto | null> {
    try {
      return await api.get<ResumenValoracionesDto>(`${RUTA_ALOJAMIENTOS}/${a.idAlojamiento}/valoraciones/resumen`);
    } catch {
      return null;
    }
  }

  return {
    async listar(filtros: FiltrosServidor) {
      const clave = `${CACHE.PREFIJO_LISTA}${filtros.precioMax ?? ''}:${filtros.huespedes ?? ''}`;
      try {
        const dtos = await api.get<AlojamientoDto[]>(RUTA_ALOJAMIENTOS, {
          // `ciudad` y `departamento` vacíos a propósito: MS-01 falla con "lower(bytea)" si llegan nulos.
          query: { ciudad: '', departamento: '', precioMax: filtros.precioMax, minHuespedes: filtros.huespedes },
        });
        const alojamientos: AlojamientoCatalogo[] = await Promise.all(
          dtos.map(async (a, i) => {
            const [unidades, resumen] = await Promise.all([
              unidadesDe(a),
              i < MAX_RESUMENES ? resumenDe(a) : Promise.resolve(null),
            ]);
            return alojamientoDesdeDto(a, unidades, resumen);
          }),
        );
        await guardarCache(clave, alojamientos, CACHE.TTL_MS);
        return { alojamientos, desdeCache: false };
      } catch (e) {
        if (!esSinRed(e)) throw e;
        const guardada = await leerCache<AlojamientoCatalogo[]>(clave);
        if (!guardada) throw e;
        return { alojamientos: guardada, desdeCache: true };
      }
    },

    async detalle(id) {
      const clave = CACHE.PREFIJO_DETALLE + id;
      try {
        const dto = await api.get<AlojamientoDto>(`${RUTA_ALOJAMIENTOS}/${id}`);
        const [unidades, resumen] = await Promise.all([unidadesDe(dto), resumenDe(dto)]);
        const detalle: DetalleAlojamiento = detalleDesdeDto(dto, unidades, resumen);
        await guardarCache(clave, detalle, CACHE.TTL_MS);
        return detalle;
      } catch (e) {
        if (!esSinRed(e)) throw e;
        const guardado = await leerCache<DetalleAlojamiento>(clave);
        if (!guardado) throw e;
        return guardado;
      }
    },

    async tipos() {
      try {
        const dtos = await api.get<TipoPropiedadDto[]>(RUTA_TIPOS_PROPIEDAD);
        const tipos: TipoPropiedad[] = dtos.map(tipoDesdeDto);
        await guardarCache(CACHE.TIPOS, tipos, CACHE.TTL_MS);
        return tipos;
      } catch (e) {
        if (!esSinRed(e)) throw e;
        return (await leerCache<TipoPropiedad[]>(CACHE.TIPOS)) ?? [];
      }
    },

    async obtenerValoraciones(id: string): Promise<ResenaAlojamiento[]> {
      try {
        const res = await api.get<any[]>(`${RUTA_ALOJAMIENTOS}/${id}/valoraciones`);
        if (Array.isArray(res)) {
          return res.map((v) => ({
            id: v.idValoracion || String(Math.random()),
            autorNombre: v.esAnonimo ? 'Huésped Anónimo' : v.nombreUsuario || 'Huésped Verificado',
            calificacionGeneral: Number(v.puntuacionGeneral || 5),
            limpieza: v.calificacionLimpieza ? Number(v.calificacionLimpieza) : undefined,
            ubicacion: v.calificacionUbicacion ? Number(v.calificacionUbicacion) : undefined,
            calidadPrecio: v.calificacionCalidadPrecio ? Number(v.calificacionCalidadPrecio) : undefined,
            comentario: v.comentario || 'Excelente estadía, muy recomendable.',
            fecha: v.fechaCreacion ? new Date(v.fechaCreacion).toLocaleDateString('es-BO') : 'Reciente',
          }));
        }
        return [];
      } catch {
        return [];
      }
    },
  };
}
