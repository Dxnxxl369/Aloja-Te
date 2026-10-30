import React, { useState, useEffect } from 'react';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { pagosService } from '../services/pagosService';
import { reservasService } from '../../reservas/services/reservasService';
import { PagoResponseData } from '../types/checkout.types';
import { X, QrCode, Clock, ShieldCheck, Tag, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react';

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
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(10);
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

  const minutos = Math.floor(timeLeft / 60);
  const segundos = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Blue Liquid Glass Modal Container */}
      <div className="relative w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl liquid-glass-blue text-white shadow-2xl z-10 animate-modal-in border border-cyan-500/30 overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                PAGO SEGURO • QR SIMPLE BANCARIO (BNB)
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
              Pagar con QR Simple
            </h3>
            <p className="text-xs text-slate-300">
              Escanea desde la aplicación de cualquier banco de Bolivia habilitado
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Timer Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 mb-5 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold">Tiempo para completar el pago:</span>
          </div>
          <span className="font-mono font-bold text-sm text-cyan-200">
            {minutos.toString().padStart(2, '0')}:{segundos.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Main Content: QR & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          
          {/* QR Display */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col items-center justify-center text-center">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-xs">Generando QR Simple...</span>
              </div>
            ) : (
              <>
                {/* Simulated Official QR Frame */}
                <div className="p-3 rounded-2xl bg-white shadow-inner mb-3">
                  <div className="w-36 h-36 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-2 flex flex-col items-center justify-center relative">
                    <QrCode className="w-28 h-28 text-cyan-400 opacity-90" />
                    <span className="text-[9px] font-black text-amber-400 tracking-wider">BNB SIMPLE</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Banco Nacional de Bolivia</span>
                  <span className="text-xs font-bold text-white">ALOJATE-BOLIVIA</span>
                  <span className="text-[10px] text-cyan-300 font-mono block">TTL: 900s</span>
                </div>
              </>
            )}
          </div>

          {/* Details & Promo */}
          <div className="flex flex-col justify-between space-y-3 text-xs">
            
            {/* Promo Code Input */}
            <form onSubmit={aplicarCupon} className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">¿Tienes un cupón de descuento?</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cupon}
                    onChange={(e) => setCupon(e.target.value.toUpperCase())}
                    placeholder="BIENVENIDO2026"
                    className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                >
                  Aplicar
                </button>
              </div>
              {cuponAplicado && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Cupón del 10% aplicado correctamente
                </span>
              )}
            </form>

            {/* Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal estadía:</span>
                <span className="font-semibold text-white">{pago?.subtotalAlojamiento || reserva.importeTotal} BOB</span>
              </div>

              {pago && pago.descuento > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento promoción:</span>
                  <span className="font-semibold">-{pago.descuento} BOB</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Cargo por servicio (5%):</span>
                <span>+{pago?.cargoServicio || 0} BOB</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-white">
                <span>Total a Cobrar:</span>
                <span className="text-xl text-brand-400 font-black">
                  {pago?.montoTotal || reserva.importeTotal} BOB
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Simulation Action Bar */}
        <div className="space-y-2">
          <button
            onClick={simularPagoBNB}
            disabled={confirmando || loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {confirmando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirmando transferencia bancaria y emitiendo factura...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Confirmar Pago desde Banca Móvil</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Al confirmar, tu reserva queda garantizada y se emite tu factura computarizada oficial con código QR.
          </p>
        </div>

      </div>
    </div>
  );
};
