import React from 'react';
import { LogOut, X, AlertTriangle, Info, Check } from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';

interface ModalAdvertenciaCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  alojamiento: Alojamiento | null;
  onConfirmarSalida: (idAlojamiento: string) => void;
}

export const ModalAdvertenciaCheckout: React.FC<ModalAdvertenciaCheckoutProps> = ({
  isOpen,
  onClose,
  alojamiento,
  onConfirmarSalida
}) => {
  if (!isOpen || !alojamiento) return null;

  const reservaActual = alojamiento.reservas?.[0];
  const siguienteReserva = alojamiento.reservas?.[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-md shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              ¿Registrar Salida del Huésped?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Se registrará la devolución de llaves y el cierre de la estancia en curso.
            </p>
          </div>
        </div>

        {/* Detalle de advertencia y siguiente reserva */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs space-y-2">
          {siguienteReserva ? (
            <>
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Reserva Consecutiva Detectada</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Se registrará la salida de <strong>{reservaActual?.huespedNombre}</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Próximo huésped en cola: <strong>{siguienteReserva.huespedNombre}</strong>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Horario de llegada: {siguienteReserva.desde}
                </p>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                La propiedad pasará automáticamente al estado <strong>🟡 PENDIENTE DE PIN</strong> en espera del nuevo código de ingreso.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Sin Reservas Inmediatas</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Se registrará la salida de <strong>{reservaActual?.huespedNombre}</strong>. Al no existir reservas consecutivas programadas para hoy, la propiedad quedará en estado <strong>⚪ LIBRE (Disponible)</strong>.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmarSalida(alojamiento.idAlojamiento)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Salida &amp; Actualizar Estado</span>
          </button>
        </div>

      </div>
    </div>
  );
};
