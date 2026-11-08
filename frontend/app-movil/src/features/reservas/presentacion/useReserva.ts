// ======================================================================
// ARCHIVO: reservas/presentacion/useReserva.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El hook que mantiene una reserva al día: la pide, la vuelve a pedir mientras espera el pago y cuenta los segundos que quedan.
// PARA QUÉ SIRVE: La pantalla solo pinta; no sabe de reintentos ni de temporizadores.
// SIN ÉL: La pantalla mezclaría temporizadores con diseño.
// NO VA AQUÍ: Diseño ni reglas (están en domain/casos.ts).
// ======================================================================

import { useCallback, useEffect, useState } from 'react';
import { POLL_RESERVA_MS } from '../constantes';
import type { CasosReservas } from '../domain/interfaces';
import type { Reserva } from '../domain/modelos';

export function useReserva(casos: CasosReservas, id: string | null) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segundos, setSegundos] = useState<number | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  // Pide la reserva y, mientras esté PENDIENTE_PAGO, la vuelve a pedir cada POLL_RESERVA_MS.
  useEffect(() => {
    if (!id) return;
    let vivo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cargar = async () => {
      let siguiente = POLL_RESERVA_MS;
      try {
        const r = await casos.obtenerReserva(id);
        if (!vivo) return;
        setReserva(r);
        setError(null);
        if (r.estado !== 'PENDIENTE_PAGO') return; // estado final: dejar de preguntar
      } catch (e) {
        if (!vivo) return;
        setError(e instanceof Error ? e.message : 'No se pudo cargar la reserva');
        siguiente = POLL_RESERVA_MS * 2;
      }
      timer = setTimeout(cargar, siguiente);
    };
    void cargar();
    return () => {
      vivo = false;
      if (timer) clearTimeout(timer);
    };
  }, [casos, id]);

  // Cuenta regresiva de 1 segundo.
  useEffect(() => {
    if (!reserva) return;
    setSegundos(casos.segundosRestantes(reserva));
    if (casos.segundosRestantes(reserva) === null) return;
    const t = setInterval(() => setSegundos(casos.segundosRestantes(reserva)), 1000);
    return () => clearInterval(t);
  }, [casos, reserva]);

  /** Cancela la reserva pendiente. Si sale bien, la pantalla pasa a mostrarla como cancelada. */
  const cancelar = useCallback(async () => {
    if (!id) return;
    setCancelando(true);
    setErrorCancelar(null);
    try {
      setReserva(await casos.cancelarReserva(id));
    } catch (e) {
      setErrorCancelar(e instanceof Error ? e.message : 'No se pudo cancelar la reserva.');
    } finally {
      setCancelando(false);
    }
  }, [casos, id]);

  return {
    reserva,
    error,
    segundos,
    sePuedePagar: reserva ? casos.sePuedePagar(reserva) : false,
    cancelar,
    cancelando,
    errorCancelar,
  };
}

export function formatearSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
