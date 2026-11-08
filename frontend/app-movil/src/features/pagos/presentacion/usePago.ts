// ======================================================================
// ARCHIVO: pagos/presentacion/usePago.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El hook que inicia el pago una sola vez, espera la confirmación del banco y cuenta el tiempo del QR.
// PARA QUÉ SIRVE: La pantalla solo pinta el QR y el estado.
// SIN ÉL: La pantalla mezclaría temporizadores y llamadas.
// NO VA AQUÍ: Diseño ni reglas (están en domain/casos.ts).
// ======================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { POLL_PAGO_MS } from '../constantes';
import type { CasosPagos } from '../domain/interfaces';
import type { Pago, SolicitudPago } from '../domain/modelos';

export function usePago(casos: CasosPagos, solicitud: SolicitudPago) {
  const [pago, setPago] = useState<Pago | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [reloj, setReloj] = useState<{ inicio: number; ahora: number } | null>(null);
  const solicitudRef = useRef(solicitud); // no re-iniciar si el padre re-renderiza
  const pagoId = pago?.id;
  const final = pago ? casos.esFinal(pago) : false;
  const cadenaQr = pago?.qr?.cadena;

  const iniciar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setPago(await casos.iniciarPago(solicitudRef.current));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el pago');
    } finally {
      setCargando(false);
    }
  }, [casos]);

  useEffect(() => {
    void iniciar();
  }, [iniciar]);

  // Mientras esté PENDIENTE, preguntar si el banco ya confirmó.
  useEffect(() => {
    if (!pagoId || final) return;
    let vivo = true;
    const t = setInterval(async () => {
      try {
        const p = await casos.obtenerPago(pagoId);
        if (vivo) setPago(p);
      } catch {
        /* un fallo de red puntual no corta la espera */
      }
    }, POLL_PAGO_MS);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [casos, pagoId, final]);

  // Cuenta regresiva del QR: arranca cuando aparece el QR y corre mientras el pago esté pendiente.
  useEffect(() => {
    if (!cadenaQr || final) return;
    const inicio = Date.now();
    setReloj({ inicio, ahora: inicio });
    const t = setInterval(() => setReloj({ inicio, ahora: Date.now() }), 1000);
    return () => clearInterval(t);
  }, [cadenaQr, final]);

  const confirmarSimulado = casos.confirmarSimulado;
  const simular = useCallback(async () => {
    if (!pagoId || !confirmarSimulado) return;
    try {
      setPago(await confirmarSimulado(pagoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo confirmar');
    }
  }, [pagoId, confirmarSimulado]);

  /** Segundos que le quedan al QR; null si no hay QR o el pago ya terminó. */
  const segundosQr =
    pago?.qr && reloj && !final
      ? Math.max(0, pago.qr.expiraEnSegundos - Math.floor((reloj.ahora - reloj.inicio) / 1000))
      : null;

  return { pago, error, cargando, segundosQr, reintentar: iniciar, simular: confirmarSimulado ? simular : null };
}

export function formatearSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
