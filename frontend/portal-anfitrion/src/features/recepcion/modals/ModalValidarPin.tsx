import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, Copy } from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';

interface ModalValidarPinProps {
  isOpen: boolean;
  onClose: () => void;
  alojamiento: Alojamiento | null;
  onConfirmarIngreso: (idAlojamiento: string, pin: string) => void;
}

export const ModalValidarPin: React.FC<ModalValidarPinProps> = ({
  isOpen,
  onClose,
  alojamiento,
  onConfirmarIngreso
}) => {
  if (!isOpen || !alojamiento) return null;

  const reserva = alojamiento.reservas?.[0];
  const pinSugerido = reserva?.pinSecreto || '839102';
  const [pinInput, setPinInput] = useState('');

  const autoLlenarPin = () => {
    setPinInput(pinSugerido);
  };

  const handleValidar = () => {
    if (!pinInput.trim() || pinInput.trim().length < 4) {
      alert('Por favor introduce el código PIN de 6 dígitos del viajero.');
      return;
    }
    onConfirmarIngreso(alojamiento.idAlojamiento, pinInput.trim());
    setPinInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-md shadow-amber-500/20 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Validar PIN de Check-in
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Entrega oficial de llaves &amp; activación de estancia
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

        {/* Resumen del huésped */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>{alojamiento.titulo}</span>
            <span className="font-mono text-emerald-600">Bs. {reserva?.montoTotal || alojamiento.precioBaseNoche}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">{alojamiento.ciudad}, {alojamiento.departamento}</p>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span>Huésped: <strong className="text-slate-900 dark:text-white">{reserva?.huespedNombre || 'Viajero'}</strong></span>
            <span className="text-slate-500 font-mono">{reserva?.desde || 'Hoy'}</span>
          </div>
        </div>

        {/* Input del PIN */}
        <div className="space-y-3">
          <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 text-center">
            Introduce el código PIN de 6 dígitos que te entrega el huésped:
          </label>

          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="839102"
              className="w-full max-w-[260px] text-center font-mono text-2xl font-bold tracking-[0.35em] py-3 rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition"
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={autoLlenarPin}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Autorellenar PIN de prueba ({pinSugerido})</span>
            </button>
          </div>
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
            onClick={handleValidar}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Validar PIN &amp; Entregar Llaves</span>
          </button>
        </div>

      </div>
    </div>
  );
};
