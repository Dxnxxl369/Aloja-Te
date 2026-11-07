// ======================================================================
// ARCHIVO: agente/data/mapeadores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las funciones que convierten lo que llega de fuera (alojamientos de MS-01, texto/JSON de un modelo de IA) en modelos limpios del agente.
// PARA QUÉ SIRVE: Una salida de IA es poco confiable: aquí se valida CADA campo y lo inválido se descarta.
// SIN ÉL: Un JSON mal formado del modelo rompería el plan.
// NO VA AQUÍ: Llamadas a la red.
// ======================================================================

import { LIMITES } from '../constantes';
import type { Criterios, Intencion, Opcion } from '../domain/modelos';
import type { AlojamientoDto, ResumenValoracionesDto, UnidadDto } from './modelos';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Primera foto según `orden`; undefined si no hay. */
function fotoPrincipal(a: AlojamientoDto): string | undefined {
  const fotos = [...(a.fotografias ?? [])].sort((x, y) => (x.orden ?? 0) - (y.orden ?? 0));
  return fotos[0]?.url || undefined;
}

/** Aplana alojamientos -> unidades que sirven para estos criterios. */
export function opcionesDesdeAlojamientos(
  alojamientos: AlojamientoDto[],
  unidadesExtra: Record<string, UnidadDto[]>,
  c: Criterios,
  resumenes: Record<string, ResumenValoracionesDto | null> = {},
): Opcion[] {
  const opciones: Opcion[] = [];
  for (const a of alojamientos) {
    const unidades = a.unidades?.length ? a.unidades : (unidadesExtra[a.idAlojamiento] ?? []);
    const resumen = resumenes[a.idAlojamiento];
    const tieneResenas = !!resumen && resumen.totalResenas > 0 && resumen.calificacionPromedio !== null;
    for (const u of unidades) {
      if (u.estado !== 'DISPONIBLE') continue;
      if (c.huespedes && u.capacidadHuespedes < c.huespedes) continue;
      if (c.presupuestoMaxNoche && u.precioNoche > c.presupuestoMaxNoche) continue;
      opciones.push({
        fotoUrl: fotoPrincipal(a),
        tipoPropiedad: a.tipoPropiedadNombre,
        servicios: (a.servicios ?? []).map((s) => s.nombre),
        calificacion: tieneResenas ? Number(resumen.calificacionPromedio) : null,
        totalResenas: tieneResenas ? resumen.totalResenas : 0,
        alojamientoId: a.idAlojamiento,
        anfitrionId: a.idAnfitrion,
        titulo: a.titulo,
        ciudad: a.ciudad,
        unidadId: u.idUnidad,
        unidadNombre: u.nombre,
        capacidad: u.capacidadHuespedes,
        precioNoche: Number(u.precioNoche),
      });
    }
  }
  return opciones;
}

/** Valida un objeto cualquiera como Intencion: lo que no cumple se descarta. */
export function intencionDesdeObjeto(o: unknown): Intencion {
  if (typeof o !== 'object' || o === null) return {};
  const r = o as Record<string, unknown>;
  const out: Intencion = {};

  if (typeof r.ciudad === 'string') {
    const t = r.ciudad.trim();
    if (t && t.length <= LIMITES.CIUDAD_MAX_CHARS) out.ciudad = t;
  }
  if (typeof r.checkIn === 'string' && FECHA.test(r.checkIn)) out.checkIn = r.checkIn;
  if (typeof r.checkOut === 'string' && FECHA.test(r.checkOut)) out.checkOut = r.checkOut;

  const huespedes = Number(r.huespedes);
  if (Number.isInteger(huespedes) && huespedes >= 1 && huespedes <= LIMITES.HUESPEDES_MAX) out.huespedes = huespedes;

  const presupuesto = Number(r.presupuestoMaxNoche);
  if (Number.isFinite(presupuesto) && presupuesto > 0 && presupuesto <= LIMITES.PRESUPUESTO_MAX) {
    out.presupuestoMaxNoche = presupuesto;
  }
  return out;
}

/** El modelo local responde texto: se busca el primer JSON dentro (puede venir con explicaciones). */
export function intencionDesdeTexto(texto: string): Intencion {
  const m = texto.match(/\{[\s\S]*\}/);
  if (!m) return {};
  try {
    return intencionDesdeObjeto(JSON.parse(m[0]));
  } catch {
    return {};
  }
}
