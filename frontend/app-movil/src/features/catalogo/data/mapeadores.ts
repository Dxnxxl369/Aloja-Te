// ======================================================================
// ARCHIVO: catalogo/data/mapeadores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las funciones que traducen los DTO de MS-01 al modelo del catálogo.
// PARA QUÉ SIRVE: Es la única frontera: nada del backend pasa a la app sin pasar por aquí.
// SIN ÉL: La pantalla dependería de nombres como `idTipoPropiedad` o `fotografias`.
// NO VA AQUÍ: Llamadas a la red ni a la base.
// ======================================================================

import type { AlojamientoCatalogo, DetalleAlojamiento, TipoPropiedad, UnidadCatalogo } from '../domain/modelos';
import type { AlojamientoDto, ResumenValoracionesDto, TipoPropiedadDto, UnidadDto } from './modelos';

/** Texto sin espacios sobrantes; undefined si queda vacío o no es texto. */
function texto(valor: string | null | undefined): string | undefined {
  const t = typeof valor === 'string' ? valor.trim() : '';
  return t || undefined;
}

/** El precio más bajo y la mayor capacidad entre las unidades que se pueden reservar. */
function precioYCapacidad(unidades: UnidadDto[]): { precioDesde: number | null; capacidadMax: number | null } {
  const disponibles = unidades.filter((u) => u.estado === 'DISPONIBLE');
  const precios = disponibles.map((u) => Number(u.precioNoche)).filter((n) => Number.isFinite(n) && n > 0);
  const capacidades = disponibles.map((u) => Number(u.capacidadHuespedes)).filter((n) => Number.isFinite(n) && n > 0);
  return {
    precioDesde: precios.length > 0 ? Math.min(...precios) : null,
    capacidadMax: capacidades.length > 0 ? Math.max(...capacidades) : null,
  };
}

/** Las unidades que se pueden reservar (disponibles, con precio y capacidad válidos), de la más barata a la más cara. */
function unidadesReservables(unidades: UnidadDto[]): UnidadCatalogo[] {
  const lista: UnidadCatalogo[] = [];
  for (const u of unidades) {
    const precioNoche = Number(u.precioNoche);
    const capacidad = Number(u.capacidadHuespedes);
    if (u.estado !== 'DISPONIBLE' || !(precioNoche > 0) || !Number.isInteger(capacidad) || capacidad < 1) continue;
    lista.push({ id: u.idUnidad, nombre: texto(u.nombre) ?? 'Habitación', capacidad, precioNoche });
  }
  return lista.sort((a, b) => a.precioNoche - b.precioNoche);
}

function calificacionDe(resumen: ResumenValoracionesDto | null): { calificacion: number | null; totalResenas: number } {
  const tieneResenas = !!resumen && resumen.totalResenas > 0 && resumen.calificacionPromedio !== null;
  return tieneResenas
    ? { calificacion: Number(resumen.calificacionPromedio), totalResenas: resumen.totalResenas }
    : { calificacion: null, totalResenas: 0 };
}

export function alojamientoDesdeDto(
  a: AlojamientoDto,
  unidades: UnidadDto[],
  resumen: ResumenValoracionesDto | null,
): AlojamientoCatalogo {
  const fotos = [...(a.fotografias ?? [])].sort((x, y) => (x.orden ?? 0) - (y.orden ?? 0));
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
    ...calificacionDe(resumen),
    ...precioYCapacidad(unidades),
  };
}

/** "14:00:00" -> "14:00"; undefined si no tiene forma de hora. */
function hora(valor: string | null | undefined): string | undefined {
  const m = typeof valor === 'string' ? valor.trim().match(/^(\d{2}:\d{2})/) : null;
  return m?.[1];
}

/** Una coordenada válida, o undefined (MS-01 la manda como número o como texto). */
function coordenada(valor: number | string | null | undefined, limite: number): number | undefined {
  if (valor === null || valor === undefined || valor === '') return undefined;
  const n = Number(valor);
  return Number.isFinite(n) && Math.abs(n) <= limite ? n : undefined;
}

export function detalleDesdeDto(
  a: AlojamientoDto,
  unidades: UnidadDto[],
  resumen: ResumenValoracionesDto | null,
): DetalleAlojamiento {
  const latitud = coordenada(a.latitud, 90);
  const longitud = coordenada(a.longitud, 180);
  // (0, 0) es el "no cargaron la ubicación" típico: mandaría al usuario al océano.
  const hayMapa = latitud !== undefined && longitud !== undefined && !(latitud === 0 && longitud === 0);

  const fotos = [...(a.fotografias ?? [])]
    .sort((x, y) => (x.orden ?? 0) - (y.orden ?? 0))
    .map((f) => texto(f.url))
    .filter((u): u is string => !!u);
  const servicios = [...new Set((a.servicios ?? []).map((s) => texto(s.nombre)).filter((n): n is string => !!n))];

  return {
    id: a.idAlojamiento,
    anfitrionId: a.idAnfitrion,
    titulo: a.titulo,
    tipo: texto(a.tipoPropiedadNombre),
    ciudad: a.ciudad,
    departamento: texto(a.departamento),
    direccion: texto(a.direccion),
    descripcion: texto(a.descripcion),
    politicas: texto(a.politicas),
    horarioEntrada: hora(a.horarioEntrada),
    horarioSalida: hora(a.horarioSalida),
    latitud: hayMapa ? latitud : undefined,
    longitud: hayMapa ? longitud : undefined,
    fotos,
    servicios,
    unidades: unidadesReservables(unidades),
    ...calificacionDe(resumen),
    ...precioYCapacidad(unidades),
  };
}

export function tipoDesdeDto(t: TipoPropiedadDto): TipoPropiedad {
  return { id: t.idTipoPropiedad, nombre: t.nombre };
}
