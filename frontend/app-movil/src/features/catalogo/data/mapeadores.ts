// ======================================================================
// ARCHIVO: catalogo/data/mapeadores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las funciones que traducen los DTO de MS-01 al modelo del catálogo.
// PARA QUÉ SIRVE: Es la única frontera: nada del backend pasa a la app sin pasar por aquí.
// SIN ÉL: La pantalla dependería de nombres como `idTipoPropiedad` o `fotografias`.
// NO VA AQUÍ: Llamadas a la red ni a la base.
// ======================================================================

import type { AlojamientoCatalogo, TipoPropiedad } from '../domain/modelos';
import type { AlojamientoDto, ResumenValoracionesDto, TipoPropiedadDto, UnidadDto } from './modelos';

/** Texto sin espacios sobrantes; undefined si queda vacío o no es texto. */
function texto(valor: string | null | undefined): string | undefined {
  const t = typeof valor === 'string' ? valor.trim() : '';
  return t || undefined;
}

export function alojamientoDesdeDto(
  a: AlojamientoDto,
  unidades: UnidadDto[],
  resumen: ResumenValoracionesDto | null,
): AlojamientoCatalogo {
  const disponibles = unidades.filter((u) => u.estado === 'DISPONIBLE');
  const precios = disponibles.map((u) => Number(u.precioNoche)).filter((n) => Number.isFinite(n) && n > 0);
  const capacidades = disponibles.map((u) => Number(u.capacidadHuespedes)).filter((n) => Number.isFinite(n) && n > 0);
  const fotos = [...(a.fotografias ?? [])].sort((x, y) => (x.orden ?? 0) - (y.orden ?? 0));
  const tieneResenas = !!resumen && resumen.totalResenas > 0 && resumen.calificacionPromedio !== null;

  return {
    id: a.idAlojamiento,
    anfitrionId: a.idAnfitrion,
    titulo: a.titulo,
    tipoId: typeof a.idTipoPropiedad === 'number' ? a.idTipoPropiedad : undefined,
    tipo: texto(a.tipoPropiedadNombre),
    ciudad: a.ciudad,
    departamento: texto(a.departamento),
    descripcion: texto(a.descripcion),
    fotoUrl: texto(fotos[0]?.url),
    calificacion: tieneResenas ? Number(resumen.calificacionPromedio) : null,
    totalResenas: tieneResenas ? resumen.totalResenas : 0,
    precioDesde: precios.length > 0 ? Math.min(...precios) : null,
    capacidadMax: capacidades.length > 0 ? Math.max(...capacidades) : null,
  };
}

export function tipoDesdeDto(t: TipoPropiedadDto): TipoPropiedad {
  return { id: t.idTipoPropiedad, nombre: t.nombre };
}
