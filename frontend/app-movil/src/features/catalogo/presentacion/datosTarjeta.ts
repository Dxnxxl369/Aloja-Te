// ======================================================================
// ARCHIVO: catalogo/presentacion/datosTarjeta.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Convierte un alojamiento del catálogo en los datos que dibuja la tarjeta.
// PARA QUÉ SIRVE: La tarjeta (shared/ui) no conoce el dominio del catálogo.
// SIN ÉL: La pantalla armaría ese objeto en cada lugar donde usa una tarjeta.
// NO VA AQUÍ: Diseño.
// ======================================================================

import type { DatosTarjetaAlojamiento } from '../../../shared/ui/TarjetaAlojamiento';
import type { AlojamientoCatalogo } from '../domain/modelos';

export function datosTarjeta(a: AlojamientoCatalogo): DatosTarjetaAlojamiento {
  return {
    id: a.id,
    titulo: a.titulo,
    tipo: a.tipo,
    ciudad: a.ciudad,
    departamento: a.departamento,
    descripcion: a.descripcion,
    fotoUrl: a.fotoUrl,
    calificacion: a.calificacion,
    totalResenas: a.totalResenas,
    precioNoche: a.precioDesde,
    // Todo lo que MS-01 publica pasó la moderación.
    verificado: true,
  };
}
