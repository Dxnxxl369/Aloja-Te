// ======================================================================
// ARCHIVO: catalogo/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los valores fijos del catálogo: rutas de MS-01, límites y la caché.
// PARA QUÉ SIRVE: Cambiar una ruta o un límite en un solo lugar.
// SIN ÉL: Números y rutas repartidos por el código.
// NO VA AQUÍ: Lógica ni lectura de variables de entorno.
// ======================================================================

/** MS-01 vía Gateway (AlojamientoController: GET /api/v1/alojamientos?ciudad&departamento&precioMax&minHuespedes). */
export const RUTA_ALOJAMIENTOS = '/api/v1/alojamientos';

/** MS-01 vía Gateway (CatalogoController: GET /api/v1/catalogos/tipos-propiedad). */
export const RUTA_TIPOS_PROPIEDAD = '/api/v1/catalogos/tipos-propiedad';

/** A cuántos alojamientos se les pide la calificación (es una llamada por cada uno). */
export const MAX_RESUMENES = 12;

/** Cuántos alojamientos caben en "Destacados". */
export const MAX_DESTACADOS = 5;

/** Opciones rápidas de la hoja de filtros. */
export const PRECIOS_MAX_RAPIDOS = [150, 300, 500, 800] as const;
export const HUESPEDES_RAPIDOS = [1, 2, 3, 4, 6] as const;

/** Prefijos de la caché local (tabla `cache` de core). */
export const CACHE = {
  PREFIJO_LISTA: 'catalogo-lista:',
  // "v2": la ficha ahora trae anfitrión y unidades; las copias viejas no los tienen y no deben usarse.
  PREFIJO_DETALLE: 'catalogo-detalle-v2:',
  TIPOS: 'catalogo-tipos',
  TTL_MS: 24 * 60 * 60 * 1000,
} as const;
