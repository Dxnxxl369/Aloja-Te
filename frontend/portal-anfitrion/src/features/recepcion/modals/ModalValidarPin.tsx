import React, { useState } from 'react';
import { KeyRound, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';

interface ModalValidarPinProps {
  isOpen: boolean;
  onClose: () => void;
  alojamiento: Alojamiento | null;
  onConfirmarIngreso: (idAlojamiento: string, pin: string) => Promise<boolean> | void;
}

export const ModalValidarPin: React.FC<ModalValidarPinProps> = ({
  isOpen,
  onClose,
  alojamiento,
  onConfirmarIngreso
}) => {
  if (!isOpen || !alojamiento) return null;

  const reserva = alojamiento.reservas?.[0];
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);

  const handleValidar = async () => {
    setError(null);
    const pinLimpio = pinInput.trim();
    if (!pinLimpio || pinLimpio.length !== 6) {
      setError('Por favor introduce el código PIN exacto de 6 dígitos.');
      return;
    }

    setValidando(true);
    try {
      const res = await onConfirmarIngreso(alojamiento.idAlojamiento, pinLimpio);
      if (res === false) {
        setError('El código PIN ingresado es incorrecto.');
      } else {
        setPinInput('');
        setError(null);
      }
    } catch (err: any) {
      setError('Error al validar el PIN. Inténtalo de nuevo.');
    } finally {
      setValidando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-amber-200/80 dark:border-amber-900/60 shadow-2xl p-6 sm:p-7 space-y-5">
        
        {/* Cabecera con icono amarillo cálido */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-md shadow-amber-500/20 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Registrar ingreso
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

        {/* Resumen del huésped */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Huésped:</span>
            <strong className="text-slate-900 dark:text-white">
              {reserva?.huespedNombre || 'Huésped registrado'}
            </strong>
          </div>
          {reserva?.desde && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Estadía:</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                {reserva.desde} hasta {reserva.hasta}
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-400 pt-0.5">
            {alojamiento.ciudad}, {alojamiento.departamento}
          </p>
        </div>

        {/* Input con borde y resplandor amarillo */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
            Introduce el código PIN de 6 dígitos:
          </label>

          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value.replace(/\D/g, ''));
                if (error) setError(null);
              }}
              placeholder="839102"
              autoFocus
              disabled={validando}
              className="w-full max-w-[260px] text-center font-mono text-2xl font-bold tracking-[0.35em] py-3 rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-400/25 transition shadow-inner disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center justify-center gap-2 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Acciones con botón amarillo vivo */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={validando}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleValidar}
            disabled={validando || pinInput.trim().length !== 6}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {validando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando PIN...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirmar ingreso</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};