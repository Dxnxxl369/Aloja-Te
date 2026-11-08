import React from 'react';
import { LogOut, X, Check, Users } from 'lucide-react';
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
        
        {/* Cabecera con icono azul destacado */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-md shadow-blue-500/20 shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Registrar salida
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {alojamiento.titulo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de confirmación y siguiente reserva (humano y claro) */}
        <div className="space-y-3 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            ¿Confirmar la salida de <strong className="text-slate-900 dark:text-white font-bold">{reservaActual?.huespedNombre || 'huésped actual'}</strong>?
          </p>

          {siguienteReserva ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Siguiente huésped programado</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {siguienteReserva.huespedNombre}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                Llegada: {siguienteReserva.desde}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-xs italic">
              La propiedad quedará disponible para nuevas reservas.
            </p>
          )}
        </div>

        {/* Acciones con botón azul vivo */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmarSalida(alojamiento.idAlojamiento)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar salida</span>
          </button>
        </div>

      </div>
    </div>
  );
};