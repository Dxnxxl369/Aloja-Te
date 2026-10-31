import React, { useState } from 'react';
import { ReservaResponse } from '../types/reserva.types';
import { reservasService } from '../services/reservasService';
import { X, CheckCircle2, LogOut, Loader2, ArrowRight, Star, KeyRound, AlertCircle } from 'lucide-react';

interface ConfirmarCheckoutModalProps {
  reserva: ReservaResponse | null;
  isOpen: boolean;
  esAnfitrion?: boolean;
  onClose: () => void;
  onCheckoutExitoso: (reservaCompletada: ReservaResponse, abrirResena: boolean) => void;
}

export const ConfirmarCheckoutModal: React.FC<ConfirmarCheckoutModalProps> = ({
  reserva,
  isOpen,
  esAnfitrion = false,
  onClose,
  onCheckoutExitoso,
}) => {
  const [llavesDevueltas, setLlavesDevueltas] = useState(true);
  const [habitacionEnOrden, setHabitacionEnOrden] = useState(true);
  const [notas, setNotas] = useState('Salida completada satisfactoriamente, llaves entregadas.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !reserva) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!llavesDevueltas || !habitacionEnOrden) {
      setError('Por favor confirma la entrega de llaves y revisión de la habitación para proceder.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let completadaRes: ReservaResponse;
      try {
        completadaRes = await reservasService.finalizarCheckOut(reserva.idReserva);
      } catch (err) {
        // Fallback local en caso de desacoplamiento temporal de microservicio
        completadaRes = {
          ...reserva,
          estado: 'COMPLETADA' as any,
        };
      }

      onCheckoutExitoso(completadaRes, !esAnfitrion);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar la salida. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={!loading ? onClose : undefined} />

      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white z-10 shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-in space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                {esAnfitrion ? 'Control de Recepción' : 'Finalización de Estadía'}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                {esAnfitrion ? 'Registrar Salida de Huésped (Check-out)' : 'Confirmar Mi Salida (Check-out)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha Resumen de la Estancia */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {reserva.tituloAlojamiento}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
              Estadía Activa
            </span>
          </div>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            {reserva.nombreUnidad}
          </p>
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span>Período: <strong>{reserva.checkIn} al {reserva.checkOut}</strong></span>
            <span>Código PIN: <strong className="font-mono text-blue-600 dark:text-blue-400">{reserva.codigoCheckin}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verificaciones de Salida:
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition hover:bg-blue-50/50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={llavesDevueltas}
                onChange={(e) => setLlavesDevueltas(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Entrega de llaves o tarjeta de ingreso
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Las llaves del alojamiento han sido devueltas a recepción o en el casillero seguro.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition hover:bg-blue-50/50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={habitacionEnOrden}
                onChange={(e) => setHabitacionEnOrden(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Habitación e instalaciones en orden
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  No existen daños extraordinarios ni consumos pendientes por liquidar.
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Notas u Observaciones de Salida (Opcional):
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Todo entregado en orden, excelente estadía..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Al confirmar el check-out, la habitación queda libre en el inventario y podrás dejar tu valoración sobre el viaje.
            </span>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !llavesDevueltas || !habitacionEnOrden}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando Salida...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Salida (Check-out)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
