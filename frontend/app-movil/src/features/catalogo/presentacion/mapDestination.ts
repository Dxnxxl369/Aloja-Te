// ======================================================================
// ARCHIVO: catalogo/presentacion/mapDestination.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Decide a qué lugar apunta el botón "Ver mapa": las coordenadas si las hay; si no, la dirección escrita; si tampoco, nada.
// PARA QUÉ SIRVE: Sacar de FichaUbicacion esta regla, que se puede probar sola, sin abrir ningún mapa.
// SIN ÉL: La regla estaría dentro del componente.
// NO VA AQUÍ: Abrir la aplicación de mapas (lo hace FichaUbicacion).
// ======================================================================

import { unir } from './componentes/ficha/texto';

export interface MapPlace {
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
}

/** "lat,lon" si hay coordenadas; si no, "dirección, ciudad, departamento" (solo si hay dirección); si no, null. */
export function mapDestination({ direccion, ciudad, departamento, latitud, longitud }: MapPlace): string | null {
  if (latitud !== undefined && longitud !== undefined) return `${latitud},${longitud}`;
  return direccion ? unir([direccion, ciudad, departamento], ', ') : null;
}
