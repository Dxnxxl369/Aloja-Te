import React, { useState } from 'react';
import { reservasService } from '../../reservas/services/reservasService';
import { KeyRound, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface ValidadorPinCheckinProps {
  reservaIdDefecto?: string;
}

export const ValidadorPinCheckin: React.FC<ValidadorPinCheckinProps> = ({
  reservaIdDefecto = 'a2b2908d-05ec-4b0a-bcc7-f86f3d9d722b',
}) => {
  const [reservaId, setReservaId] = useState(reservaIdDefecto);
  const [pin, setPin] = useState('256723');
  const [notas, setNotas] = useState('Huésped verificado en recepción, llaves entregadas.');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      const res = await reservasService.realizarCheckIn(reservaId, pin, notas);
      setResultado(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error: PIN incorrecto o reserva no encontrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="w-5 h-5 text-brand-600" />
        <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
          Recepción de Huésped (Validación de PIN)
        </h4>
      </div>
      <p className="text-xs text-stone-600 dark:text-stone-300 mb-5">
        Ingresa el código PIN de 6 dígitos que te presenta el huésped al llegar a la propiedad para habilitar el Check-in seguro.
      </p>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resultado && (
        <div className="p-4 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>¡Check-in Realizado con Éxito!</span>
          </div>
          <p>
            Estado de la reserva: <span className="font-mono font-bold">{resultado.estado}</span>
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Huésped: {resultado.nombreCliente} • Unidad: {resultado.nombreUnidad}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Código de Referencia de Reserva
          </label>
          <input
            type="text"
            value={reservaId}
            onChange={(e) => setReservaId(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono text-xs focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Código PIN de 6 Dígitos
          </label>
          <input
            type="text"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="256723"
            className="w-full px-3 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono text-center tracking-widest text-2xl font-bold focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Notas de Recepción
          </label>
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando código de seguridad...</span>
            </>
          ) : (
            <>
              <span>Validar PIN y Autorizar Ingreso</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
