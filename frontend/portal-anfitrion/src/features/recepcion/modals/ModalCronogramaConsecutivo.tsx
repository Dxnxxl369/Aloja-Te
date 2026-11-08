import React from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';

interface ModalCronogramaConsecutivoProps {
  isOpen: boolean;
  onClose: () => void;
  alojamiento: Alojamiento | null;
}

export const ModalCronogramaConsecutivo: React.FC<ModalCronogramaConsecutivoProps> = ({
  isOpen,
  onClose,
  alojamiento
}) => {
  if (!isOpen || !alojamiento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
        
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              Cronograma de Reservas y Sucesión de Huéspedes
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              {alojamiento.titulo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cadena cronológica de estancias programadas para esta unidad
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista Escalonada de Reservas */}
        <div className="space-y-3">
          {(!alojamiento.reservas || alojamiento.reservas.length === 0) ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No hay reservas programadas para esta unidad.
            </div>
          ) : (
            alojamiento.reservas.map((r, idx) => {
              const esActual = idx === 0;

              return (
                <div
                  key={r.idReserva || idx}
                  className={`p-4 rounded-2xl border transition ${
                    esActual
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  } flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${
                        esActual
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      } font-bold flex items-center justify-center text-sm shrink-0`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {r.huespedNombre}
                        </h4>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                            r.estado === 'EN_USO'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {r.estado}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {r.desde} — hasta — {r.hasta}
                      </p>
                      <p className="text-[10px] text-slate-400">Tel: {r.huespedTelefono}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                      Bs. {r.montoTotal}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      QR Simple BNB
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
          >
            Cerrar Cronograma
          </button>
        </div>

      </div>
    </div>
  );
};
