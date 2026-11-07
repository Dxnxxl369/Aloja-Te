// ======================================================================
// ARCHIVO: reservas/domain/casos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las reglas de reservar: qué es una solicitud válida, cuánto tiempo queda, si todavía se puede pagar.
// PARA QUÉ SIRVE: Rechazar datos inválidos ANTES de molestar al servidor, y que agente y UI usen las mismas reglas.
// SIN ÉL: Cada pantalla validaría a su manera.
// NO VA AQUÍ: HTTP, SQLite ni React: solo recibe el repositorio por interfaz.
// ======================================================================

import { MAX_NOCHES, OFFSET_BOLIVIA_MS } from '../constantes';
import type { CasosReservas, RepositorioReservas } from './interfaces';
import type { Reserva, SolicitudReserva } from './modelos';

const DIA_MS = 24 * 60 * 60 * 1000;

/** 'YYYY-MM-DD' -> epoch ms (UTC) o null si no es una fecha real (ej. 2026-02-30). */
function fechaUtc(texto: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const t = Date.parse(`${texto}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().slice(0, 10) === texto ? t : null;
}

export function crearCasosReservas(deps: {
  repo: RepositorioReservas;
  ahora?: () => number;
}): CasosReservas {
  const { repo } = deps;
  const ahora = deps.ahora ?? Date.now;

  const noches: CasosReservas['noches'] = (checkIn, checkOut) => {
    const a = fechaUtc(checkIn);
    const b = fechaUtc(checkOut);
    if (a === null || b === null || b <= a) return null;
    return Math.round((b - a) / DIA_MS);
  };

  /** Fecha de hoy en Bolivia como epoch ms a medianoche UTC. */
  const hoyBolivia = () => Math.floor((ahora() + OFFSET_BOLIVIA_MS) / DIA_MS) * DIA_MS;

  const validarFechas: CasosReservas['validarFechas'] = (checkIn, checkOut) => {
    const n = noches(checkIn, checkOut);
    if (n === null) return 'Las fechas no son válidas: la salida debe ser posterior a la entrada.';
    if (n > MAX_NOCHES) return `La estadía máxima es de ${MAX_NOCHES} noches.`;
    if ((fechaUtc(checkIn) as number) < hoyBolivia()) return 'La fecha de entrada no puede ser pasada.';
    return null;
  };

  function validar(s: SolicitudReserva): void {
    const obligatorios: [string, string][] = [
      ['cliente', s.clienteId],
      ['nombre del cliente', s.clienteNombre],
      ['anfitrión', s.anfitrionId],
      ['alojamiento', s.alojamientoId],
      ['título del alojamiento', s.alojamientoTitulo],
      ['unidad', s.unidadId],
      ['nombre de la unidad', s.unidadNombre],
    ];
    for (const [nombre, valor] of obligatorios) {
      if (!valor?.trim()) throw new Error(`Falta ${nombre}.`);
    }
    const errorFechas = validarFechas(s.checkIn, s.checkOut);
    if (errorFechas) throw new Error(errorFechas);
    if (!Number.isInteger(s.huespedes) || s.huespedes < 1) throw new Error('Debe haber al menos 1 huésped.');
    if (!(s.precioNoche > 0)) throw new Error('El precio por noche debe ser mayor a 0.');
  }

  const segundosRestantes: CasosReservas['segundosRestantes'] = (r: Reserva) => {
    if (r.estado !== 'PENDIENTE_PAGO' || r.bloqueadaHasta === null) return null;
    return Math.max(0, Math.floor((r.bloqueadaHasta - ahora()) / 1000));
  };

  return {
    async crearReserva(solicitud) {
      validar(solicitud);
      return repo.crear(solicitud);
    },
    obtenerReserva: (id) => repo.obtener(id),
    obtenerReservaPorClave: (clave) => repo.obtenerPorClave(clave),
    verificarDisponibilidad: (unidadId, checkIn, checkOut) => {
      if (noches(checkIn, checkOut) === null) throw new Error('Las fechas no son válidas.');
      return repo.disponibilidad(unidadId, checkIn, checkOut);
    },
    validarFechas,
    noches,
    segundosRestantes,
    sePuedePagar(r) {
      if (r.estado !== 'PENDIENTE_PAGO') return false;
      const s = segundosRestantes(r);
      return s === null || s > 0;
    },
  };
}
