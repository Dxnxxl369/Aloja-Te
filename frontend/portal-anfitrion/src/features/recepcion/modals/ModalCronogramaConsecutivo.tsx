import React from 'react';
import { X, Calendar } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-5">
        
        {/* Cabecera limpia */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Próximas reservas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {alojamiento.titulo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista limpia de reservas */}
        <div className="space-y-2.5">
          {(!alojamiento.reservas || alojamiento.reservas.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay reservas registradas para esta unidad.
            </div>
          ) : (
            alojamiento.reservas.map((r, idx) => {
              const esEnUso = r.estado === 'EN_USO';
              const estadoLabel = esEnUso ? 'EN USO' : 'PENDIENTE';

              return (
                <div
                  key={r.idReserva || idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {r.huespedNombre}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            esEnUso
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {estadoLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        {r.desde} al {r.hasta}
                      </p>
                      {r.huespedTelefono && (
                        <p className="text-[10px] text-slate-400">
                          Tel: {r.huespedTelefono}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cierre */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};