// ======================================================================
// ARCHIVO: catalogo/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los valores fijos del catálogo: rutas de MS-01, límites y la caché.
// PARA QUÉ SIRVE: Cambiar una ruta o un límite en un solo lugar.
// SIN ÉL: Números y rutas repartidos por el código.
// NO VA AQUÍ: Lógica ni lectura de variables de entorno.
// ======================================================================

import { RUTA_ALOJAMIENTOS } from '../../shared/rutas';
import { DIA_MS } from '../../shared/ui/tiempo';

/** MS-01 vía Gateway (GET /api/v1/alojamientos?ciudad&departamento&precioMax&minHuespedes). La ruta se define en shared/rutas.ts porque la usan varios features. */
export { RUTA_ALOJAMIENTOS };

/** MS-01 vía Gateway (CatalogoController: GET /api/v1/catalogos/tipos-propiedad). */
export const RUTA_TIPOS_PROPIEDAD = '/api/v1/catalogos/tipos-propiedad';

/** A cuántos alojamientos se les pide la calificación (es una llamada por cada uno). */
export const MAX_RESUMENES = 12;

/** Cuántos alojamientos caben en "Destacados". */
export const MAX_DESTACADOS = 5;

/** Cuántos servicios se ven antes de "Ver los N servicios" en la ficha. */
export const MAX_SERVICES_COLLAPSED = 8;

/** Cuántos puntos se dibujan como máximo bajo el carrusel de fotos (más de 8 son ruido). */
export const MAX_PHOTO_DOTS = 8;

/** Desde cuántas letras el texto de las políticas se recorta con "Ver más", y a cuántas líneas. */
export const POLICIES_COLLAPSE_LENGTH = 180;
export const POLICIES_COLLAPSED_LINES = 4;

/** El carrusel de destacados de Explorar: ancho de la tarjeta (proporción de la pantalla, con tope), separación entre tarjetas y cuántas se dibujan a la vez. */
export const FEATURED_CAROUSEL = { WIDTH_RATIO: 0.56, MAX_WIDTH: 224, GAP: 12, INITIAL_RENDER: 3, BATCH: 3, WINDOW: 5 } as const;

/** Opciones rápidas de la hoja de filtros. */
export const PRECIOS_MAX_RAPIDOS = [150, 300, 500, 800] as const;
export const HUESPEDES_RAPIDOS = [1, 2, 3, 4, 6] as const;

/** Prefijos de la caché local (tabla `cache` de core). */
export const CACHE = {
  PREFIJO_LISTA: 'catalogo-lista:',
  // "v2": la ficha ahora trae anfitrión y unidades; las copias viejas no los tienen y no deben usarse.
  PREFIJO_DETALLE: 'catalogo-detalle-v2:',
  TIPOS: 'catalogo-tipos',
  TTL_MS: DIA_MS,
} as const;
