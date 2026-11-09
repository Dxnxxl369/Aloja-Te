// ======================================================================
// ARCHIVO: reservas/presentacion/planificarAvisos.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Decide qué avisos (notificaciones) programar para las reservas del usuario y a qué hora.
// PARA QUÉ SIRVE: Avisar "tu reserva vence en 5 minutos" y "mañana es tu check-in" aunque la app esté cerrada.
// SIN ÉL: El usuario tendría que acordarse de pagar a tiempo y de buscar su PIN.
// NO VA AQUÍ: Programar las notificaciones (es core/notificaciones) ni leer reservas.
// ======================================================================
// Reglas:
// - Reserva por pagar: un aviso 5 minutos antes de que venza el plazo (si falta más que eso).
// - Reserva confirmada: un aviso el día anterior a las 18:00 o, si ya pasó, el mismo día a las 08:00.
// - Cualquier otro estado (cancelada, expirada, completada…): ningún aviso.
// Función pura: recibe la hora actual y el reloj de cada reserva, así se puede probar sin React.

import type { AvisoLocal } from '../../../core';
import { aFecha } from '../../../shared/ui/fechas';
import type { Reserva } from '../domain/modelos';

/** Todos los avisos de reservas empiezan con esto; sirve para no tocar notificaciones de otra cosa. */
export const PREFIJO_AVISOS_RESERVA = 'reserva-';

/** Cuánto antes de que venza el pago se avisa. */
export const AVISO_PAGO_ANTES_MS = 5 * 60 * 1000;

const HORA_AVISO_VISPERA = 18;
const HORA_AVISO_DIA = 8;

export function planificarAvisos(
  reservas: Reserva[],
  ahora: number,
  segundosRestantes: (r: Reserva) => number | null,
): AvisoLocal[] {
  const avisos: AvisoLocal[] = [];
  for (const r of reservas) {
    const datos = { reservaId: r.id };

    if (r.estado === 'PENDIENTE_PAGO') {
      const seg = segundosRestantes(r);
      if (seg === null || seg <= 0) continue;
      const cuando = ahora + seg * 1000 - AVISO_PAGO_ANTES_MS;
      if (cuando <= ahora) continue; // ya falta menos de 5 minutos: un aviso ahora sería ruido
      avisos.push({
        id: `${PREFIJO_AVISOS_RESERVA}${r.id}-pago`,
        titulo: 'Tu reserva está por vencer',
        cuerpo: `Te quedan 5 minutos para pagar tu reserva en ${r.alojamientoTitulo}.`,
        cuando,
        datos,
      });
    } else if (r.estado === 'CONFIRMADA') {
      const entrada = aFecha(r.checkIn);
      if (!entrada) continue;
      const vispera = new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate() - 1, HORA_AVISO_VISPERA).getTime();
      const mismoDia = new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate(), HORA_AVISO_DIA).getTime();
      const id = `${PREFIJO_AVISOS_RESERVA}${r.id}-checkin`;
      if (vispera > ahora) {
        avisos.push({
          id,
          titulo: 'Mañana es tu check-in',
          cuerpo: `Tu reserva en ${r.alojamientoTitulo} empieza mañana. En Mis reservas está tu PIN de check-in.`,
          cuando: vispera,
          datos,
        });
      } else if (mismoDia > ahora) {
        avisos.push({
          id,
          titulo: 'Hoy es tu check-in',
          cuerpo: `Tu reserva en ${r.alojamientoTitulo} empieza hoy. Toca para ver tu PIN de check-in.`,
          cuando: mismoDia,
          datos,
        });
      }
    }
  }
  return avisos;
}
