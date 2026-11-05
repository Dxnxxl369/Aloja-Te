import React from 'react';
import { ShieldCheck, Download, Banknote, CheckCircle2 } from 'lucide-react';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';

interface LiquidacionesBNBProps {
  onMostrarToast: (msg: string) => void;
}

export const LiquidacionesBNB: React.FC<LiquidacionesBNBProps> = ({ onMostrarToast }) => {
  const { perfil } = useAnfitrionAuth();

  const handleTransferir = () => {
    onMostrarToast('Transferencia procesada. Los fondos han sido acreditados a tu cuenta BNB.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Liquidaciones &amp; Cobros Bancarios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acreditaciones automáticas a tu cuenta bancaria mediante la red QR Simple BNB
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cuenta BNB Acreditada</span>
        </span>
      </div>

      {/* Tarjeta de Cuenta Bancaria Registrada */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/25 shrink-0">
            BNB
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Banco Nacional de Bolivia S.A.
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                Abono Automático 24 hrs
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {perfil.cuentaBNB}
            </p>
            <p className="text-[11px] text-slate-400">
              Desembolsos automáticos programados tras la validación del código PIN del huésped
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center min-w-[150px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Saldo Disponible
            </span>
            <span className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              {perfil.saldoDisponible}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTransferir}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Transferir a BNB</span>
          </button>
        </div>
      </div>

      {/* Historial de Liquidaciones */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
          Historial de Liquidaciones &amp; Cobros Desglosados
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Fecha &amp; Hora</th>
                <th className="py-3 px-3">Alojamiento</th>
                <th className="py-3 px-3">Huésped</th>
                <th className="py-3 px-3">Monto Bruto</th>
                <th className="py-3 px-3">Comisión Servicio (10%)</th>
                <th className="py-3 px-3">Abono Neto</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                <td className="py-3.5 px-3 font-mono text-[11px]">Hoy 14:15</td>
                <td className="py-3.5 px-3 font-semibold">Gran Hotel Santa Cruz - Suite Presidencial</td>
                <td className="py-3.5 px-3">Lucía Suárez</td>
                <td className="py-3.5 px-3 font-mono font-bold">Bs. 850</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">- Bs. 85</td>
                <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">Bs. 765</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    Abonado BNB
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                <td className="py-3.5 px-3 font-mono text-[11px]">Hoy 12:40</td>
                <td className="py-3.5 px-3 font-semibold">Cabaña Rústica Vista a los Volcanes</td>
                <td className="py-3.5 px-3">Daniel Mamani</td>
                <td className="py-3.5 px-3 font-mono font-bold">Bs. 550</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">- Bs. 55</td>
                <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">Bs. 495</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    Abonado BNB
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                <td className="py-3.5 px-3 font-mono text-[11px]">Ayer 18:20</td>
                <td className="py-3.5 px-3 font-semibold">Gran Hotel Santa Cruz - Habitación Twin</td>
                <td className="py-3.5 px-3">Carlos Arteaga</td>
                <td className="py-3.5 px-3 font-mono font-bold">Bs. 1,260</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">- Bs. 126</td>
                <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">Bs. 1,134</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    Abonado BNB
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
