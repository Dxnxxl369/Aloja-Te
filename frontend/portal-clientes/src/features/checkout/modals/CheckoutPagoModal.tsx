import React, { useState, useEffect } from 'react';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { pagosService } from '../services/pagosService';
import { reservasService } from '../../reservas/services/reservasService';
import { PagoResponseData } from '../types/checkout.types';
import { X, QrCode, Clock, ShieldCheck, Tag, Check, Loader2, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface CheckoutPagoModalProps {
  reserva: ReservaResponse | null;
  onClose: () => void;
  onPagoCompletado: (pagoData: any, pinCheckin: string) => void;
}

export const CheckoutPagoModal: React.FC<CheckoutPagoModalProps> = ({
  reserva,
  onClose,
  onPagoCompletado,
}) => {
  const [pago, setPago] = useState<PagoResponseData | null>(null);
  const [cupon, setCupon] = useState('BIENVENIDO2026');
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos

  useEffect(() => {
    if (!reserva) return;
    iniciarProcesoPago(cupon);
  }, [reserva]);

  // Temporizador de 15 minutos
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const iniciarProcesoPago = async (codigoPromo?: string) => {
    if (!reserva) return;
    setLoading(true);
    setError(null);

    try {
      const data = await pagosService.iniciarPago({
        reservaId: reserva.idReserva,
        anfitrionId: reserva.idAnfitrion,
        subtotal: reserva.importeTotal,
        codigoPromocion: codigoPromo || undefined,
        metodoPago: 'QR_SIMPLE_BNB',
      });
      setPago(data);
      if (codigoPromo && data.descuento > 0) {
        setCuponAplicado(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al inicializar la pasarela de pago.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarCupon = (e: React.FormEvent) => {
    e.preventDefault();
    iniciarProcesoPago(cupon);
  };

  const simularPagoBNB = async () => {
    if (!pago || !reserva) return;
    setConfirmando(true);
    setError(null);

    try {
      // 1. Simular Webhook de pago confirmado por QR BNB en MS-03
      const resultadoBNB = await pagosService.confirmarPagoWebhook(pago.pagoId);
      
      // 2. Ejecutar Saga en MS-02: Confirmar Reserva, cambiar estado a CONFIRMADA y remover TTL
      let reservaConfirmada = reserva;
      try {
        reservaConfirmada = await reservasService.confirmarPagoSaga(
          reserva.idReserva,
          pago.pagoId,
          resultadoBNB.transaccionId || 'BNB-TRX-SIMULADO'
        );
      } catch (sagaErr) {
        console.warn('Saga MS-02 confirmación local:', sagaErr);
      }

      // 3. Notificar al componente padre con la factura y el PIN de check-in de MS-02
      onPagoCompletado(resultadoBNB, reservaConfirmada.codigoCheckin || reserva.codigoCheckin);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar confirmación bancaria.');
    } finally {
      setConfirmando(false);
    }
  };

  if (!reserva) return null;

  if (timeLeft <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl animate-modal-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Tiempo de Pago Expirado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Han transcurrido los 15 minutos asignados para completar el pago con QR. Para evitar sobreventas, el bloqueo temporal de inventario ha sido liberado en el sistema.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer"
          >
            Seleccionar Fechas y Reintentar
          </button>
        </div>
      </div>
    );
  }

  const minutos = Math.floor(timeLeft / 60);
  const segundos = timeLeft % 60;
  const esAlertaCritica = timeLeft < 120; // Menos de 2 minutos

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Royal Blue & White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-xl my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col">
        
        {/* Header con Badge Circular y Barra de Progreso Azul */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  PASARELA DE PAGO • PASO 2 DE 2
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Pago Seguro con QR Simple
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escanea desde la app de cualquier banco boliviano autorizado
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Bar - 100% width */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-600 transition-all duration-300 w-full" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Timer Countdown Bar */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-colors ${
            esAlertaCritica
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 animate-pulse'
              : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-900/50 text-slate-700 dark:text-slate-300'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              <Clock className={`w-4 h-4 ${esAlertaCritica ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'} animate-pulse`} />
              <span>{esAlertaCritica ? '¡Atención! Tiempo por agotarse:' : 'Tiempo restante para completar el pago:'}</span>
            </div>
            <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg shadow-sm border ${
              esAlertaCritica
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/60'
            }`}>
              {minutos.toString().padStart(2, '0')}:{segundos.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Main Grid: QR & Financial Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* QR Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center">
              {loading ? (
                <div className="py-14 flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-xs">Generando QR Simple oficial...</span>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-white shadow-md border border-slate-200/60 mb-3">
                    <div className="w-36 h-36 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center relative shadow-inner">
                      <QrCode className="w-28 h-28 text-white" />
                      <span className="text-[9px] font-black text-blue-400 tracking-wider">BNB SIMPLE QR</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Red de Pagos Bancarios BNB</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">ALOJATE-BOLIVIA OFICIAL</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold block">Válido en cualquier banca móvil</span>
                  </div>
                </>
              )}
            </div>

            {/* Details & Promo */}
            <div className="flex flex-col justify-between space-y-3 text-xs">
              
              {/* Promo Code Input */}
              <form onSubmit={aplicarCupon} className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Cupón de Descuento
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cupon}
                      onChange={(e) => setCupon(e.target.value.toUpperCase())}
                      placeholder="BIENVENIDO2026"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Cupón del 10% aplicado exitosamente
                  </span>
                )}
              </form>

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Subtotal estadía:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{pago?.subtotalAlojamiento || reserva.importeTotal} BOB</span>
                </div>

                {pago && pago.descuento > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>Descuento aplicado:</span>
                    <span className="font-semibold">-{pago.descuento} BOB</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Cargo por servicio plataforma (5%):</span>
                  <span>+{pago?.cargoServicio || 0} BOB</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex justify-between items-baseline font-bold text-slate-900 dark:text-white">
                  <span>Total a Pagar:</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-black font-mono">
                    {pago?.montoTotal || reserva.importeTotal} BOB
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Action Button & Disclaimer */}
          <div className="space-y-2 pt-2">
            <button
              onClick={simularPagoBNB}
              disabled={confirmando || loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {confirmando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirmando transferencia bancaria y emitiendo factura...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Confirmar Pago desde Banca Móvil</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Al confirmar, tu reserva queda garantizada de forma inmediata y se emite tu factura computarizada oficial con código QR.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
