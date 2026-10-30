import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { DollarSign, ArrowUpRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const LiquidacionesResumen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solicitarLiquidacion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.post(ENDPOINTS.FINANZAS.LIQUIDACIONES, {
        anfitrionId: user?.id || '5211de5d-bd9e-4cb7-8912-3fbf6a0184b0',
      });
      setResultado(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud de transferencia bancaria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
            Liquidaciones &amp; Desembolsos para Anfitriones
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          Banco BNB Activo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Total Generado</span>
          <span className="text-xl font-bold text-stone-900 dark:text-white">1,755.00 BOB</span>
        </div>
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Comisión Plataforma (10%)</span>
          <span className="text-xl font-bold text-red-500">-175.50 BOB</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block mb-1">Neto Transferible</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">1,579.50 BOB</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resultado && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Transferencia bancaria procesada: Ref {resultado.liquidacionId?.substring(0, 8)}...</span>
          </div>
          <p>Monto neto transferido: <span className="font-bold">{resultado.totalNetoTransferido || 1579.5} BOB</span></p>
          <p className="text-[10px] text-stone-400">Comprobante de depósito acreditado en cuenta bancaria BNB.</p>
        </div>
      )}

      <button
        onClick={solicitarLiquidacion}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Procesando transferencia interbancaria...</span>
          </>
        ) : (
          <>
            <span>Solicitar Desembolso a Cuenta Bancaria BNB</span>
            <ArrowUpRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
