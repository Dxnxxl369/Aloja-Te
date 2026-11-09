// ======================================================================
// ARCHIVO: catalogo/presentacion/shareMessage.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Arma el mensaje que se envía al compartir un alojamiento: "Hotel Sol en Santa Cruz desde Bs 480 por noche. Míralo en Aloja-Te."
// PARA QUÉ SIRVE: Sacar el texto de la ruta (estaba en navegacion.tsx) y poder probarlo solo.
// SIN ÉL: La ruta del detalle armaría el texto adentro.
// NO VA AQUÍ: Abrir el menú de compartir (lo hace la ruta).
// ======================================================================
// Solo usa lo que hay: sin ciudad no dice "en …", sin precio no dice "desde Bs …".

import type { DatosTarjetaAlojamiento } from '../../../shared/ui/TarjetaAlojamiento';

export function buildShareMessage(d: DatosTarjetaAlojamiento): string {
  const place = [d.ciudad, d.departamento].filter(Boolean).join(', ');
  const price = typeof d.precioNoche === 'number' ? ` desde Bs ${d.precioNoche} por noche` : '';
  return `${d.titulo}${place ? ` en ${place}` : ''}${price}. Míralo en Aloja-Te.`;
}
