import React, { useState } from 'react';
import { ReservaResponse } from '../../reservas/types/reserva.types';
import { KeyRound, Calendar, MapPin, CheckCircle, Copy, Check, Clock } from 'lucide-react';

interface MisViajesViewProps {
  reservas: ReservaResponse[];
  onNuevaReserva: () => void;
}

export const MisViajesView: React.FC<MisViajesViewProps> = ({ reservas, onNuevaReserva }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (reservas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Aún no tienes reservas activas
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          Explora nuestro catálogo nacional de alojamientos y asegura tu próxima experiencia con QR Simple.
        </p>
        <button
          onClick={onNuevaReserva}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
        >
          Explorar Alojamientos en Bolivia
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Mis Reservas &amp; Claves de Check-in
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Presenta tu código PIN de 6 dígitos al anfitrión al momento de llegar a tu hospedaje.
        </p>
      </div>

      <div className="space-y-4">
        {reservas.map((reserva) => (
          <div
            key={reserva.idReserva}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  reserva.estado === 'CONFIRMADA' || reserva.estado === 'CHECKIN_REALIZADO'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                }`}>
                  {reserva.estado}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {reserva.idReserva.substring(0, 8)}...
                </span>
              </div>

              <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                {reserva.tituloAlojamiento}
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {reserva.nombreUnidad}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  {reserva.checkIn} al {reserva.checkOut} ({reserva.nochesEstadia} noches)
                </span>
                <span className="font-bold text-stone-900 dark:text-white">
                  Total: {reserva.importeTotal} {reserva.moneda}
                </span>
              </div>
            </div>

            {/* PIN Highlight Box */}
            <div className="w-full sm:w-auto p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 text-center sm:text-right shrink-0">
              <div className="flex items-center justify-between sm:justify-end gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>PIN de Check-in</span>
                </div>
                <button
                  onClick={() => handleCopy(reserva.codigoCheckin, reserva.idReserva)}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition"
                  title="Copiar código PIN"
                >
                  {copiedId === reserva.idReserva ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 tracking-widest block">
                {reserva.codigoCheckin}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Válido para entrega de llaves
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
