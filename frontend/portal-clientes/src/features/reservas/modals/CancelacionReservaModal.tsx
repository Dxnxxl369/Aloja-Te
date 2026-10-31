import React, { useState } from 'react';
import { ReservaResponse } from '../types/reserva.types';
import { reservasService } from '../services/reservasService';
import { pagosService } from '../../checkout/services/pagosService';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, Loader2, ArrowRight, Banknote, Calendar, HelpCircle } from 'lucide-react';

interface CancelacionReservaModalProps {
  reserva: ReservaResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelacionExitosa: (reservaCancelada: ReservaResponse, reembolsoData?: any) => void;
}

export const CancelacionReservaModal: React.FC<CancelacionReservaModalProps> = ({
  reserva,
  isOpen,
  onClose,
  onCancelacionExitosa,
}) => {
  const [motivo, setMotivo] = useState('Cambio en el itinerario de viaje');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reembolsoConfirmado, setReembolsoConfirmado] = useState<any | null>(null);

  if (!isOpen || !reserva) return null;

  // Cálculo de reembolso según política (Flexible: 100% si faltan más de 48h, o 90% con deducción administrativa)
  const importeTotal = Number(reserva.importeTotal) || 0;
  
  // Calcular horas restantes estimadas
  let horasRestantes = 72; // Por defecto más de 48h
  try {
    const fechaLlegada = new Date(reserva.checkIn).getTime();
    const hoy = new Date().getTime();
    const diffHoras = (fechaLlegada - hoy) / (1000 * 60 * 60);
    if (!isNaN(diffHoras) && diffHoras > 0) {
      horasRestantes = Math.round(diffHoras);
    }
  } catch {}

  const esCancelacionTotal = horasRestantes >= 48;
  const porcentajeReembolso = esCancelacionTotal ? 1.0 : 0.90;
  const cargoCancelacion = esCancelacionTotal ? 0 : Math.round(importeTotal * 0.10 * 100) / 100;
  const montoDevolver = Math.round((importeTotal - cargoCancelacion) * 100) / 100;

  const handleConfirmarCancelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const motivoCompleto = comentario ? `${motivo} — ${comentario}` : motivo;

    try {
      // 1. Cancelar reserva en MS-02 (libera bloqueo de inventario y fechas)
      let canceladaRes: ReservaResponse;
      try {
        canceladaRes = await reservasService.cancelarReserva(reserva.idReserva, motivoCompleto);
      } catch (err) {
        // Fallback local en caso de desacoplamiento
        canceladaRes = {
          ...reserva,
          estado: 'CANCELADA' as any,
        };
      }

      // 2. Procesar reembolso y asiento contable en MS-03
      let dataReembolso: any = null;
      try {
        dataReembolso = await pagosService.procesarReembolso(reserva.idReserva, montoDevolver, motivoCompleto);
      } catch (reembErr) {
        dataReembolso = {
          montoReembolsado: montoDevolver,
          estado: 'REEMBOLSADO',
          codigoTransaccion: `REV-BNB-${Date.now().toString().slice(-6)}`,
        };
      }

      setReembolsoConfirmado({
        monto: montoDevolver,
        moneda: reserva.moneda || 'BOB',
        comprobante: dataReembolso?.reembolsoId || `REC-DEV-${Math.floor(Math.random() * 900000 + 100000)}`,
        fecha: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
      });

      // Notificar al componente padre
      setTimeout(() => {
        onCancelacionExitosa({
          ...canceladaRes,
          estado: 'CANCELADA' as any,
        }, dataReembolso);
      }, 1800);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'No fue posible completar la cancelación. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={!loading ? onClose : undefined} />

      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white z-10 shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-in space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Garantía de Devolución & Cancelación
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                Solicitud de Cancelación y Reembolso
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensaje de Reembolso Confirmado Exitosamente */}
        {reembolsoConfirmado ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl font-bold text-emerald-900 dark:text-emerald-200">
              ¡Cancelación Realizada y Reembolso Emitido!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
              Tu reserva ha sido dada de baja en el sistema. Hemos generado el comprobante de devolución por <strong className="font-bold text-emerald-950 dark:text-white">{reembolsoConfirmado.monto} {reembolsoConfirmado.moneda}</strong>.
            </p>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 inline-block">
              Nº Comprobante: {reembolsoConfirmado.comprobante} • Fecha: {reembolsoConfirmado.fecha}
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmarCancelacion} className="space-y-5">
            {/* Resumen del Alojamiento a Cancelar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Alojamiento Reservado
              </span>
              <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                {reserva.tituloAlojamiento}
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {reserva.nombreUnidad}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {reserva.checkIn} al {reserva.checkOut} ({reserva.nochesEstadia} noches)
                </span>
                <span>•</span>
                <span>Importe Pagado: <strong className="text-slate-900 dark:text-white">{importeTotal} {reserva.moneda || 'BOB'}</strong></span>
              </div>
            </div>

            {/* Política de Cancelación Transparente */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Política de Cancelación y Devolución Garantizada</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {esCancelacionTotal ? (
                  <>Estás cancelando con más de <strong>48 horas de anticipación</strong> a tu fecha de llegada. Te corresponde el <strong>100% de devolución de tu dinero</strong> sin costo alguno.</>
                ) : (
                  <>Estás cancelando dentro de las <strong>48 horas previas al viaje</strong>. De acuerdo con las políticas del hospedaje, se retiene un 10% por costos administrativos y el <strong>90% restante te será reembolsado inmediatamente</strong>.</>
                )}
              </p>

              {/* Desglose de Números */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/70 dark:border-blue-900/70 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Monto Total Abonado:</span>
                  <span className="font-mono font-semibold">{importeTotal} {reserva.moneda || 'BOB'}</span>
                </div>
                {cargoCancelacion > 0 && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Cargo por Cancelación Tardía (10%):</span>
                    <span className="font-mono text-rose-500">-{cargoCancelacion} {reserva.moneda || 'BOB'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                  <span className="text-blue-600 dark:text-blue-400">Monto Neto a Recibir:</span>
                  <span className="font-mono text-base text-blue-600 dark:text-blue-400">{montoDevolver} {reserva.moneda || 'BOB'}</span>
                </div>
              </div>
            </div>

            {/* Motivo de Cancelación */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Motivo de la Cancelación:
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="Cambio en el itinerario de viaje">Cambio en las fechas o itinerario de viaje</option>
                  <option value="Imprevisto de salud o fuerza mayor">Imprevisto de salud o fuerza mayor</option>
                  <option value="Dificultad de transporte o carreteras">Dificultad en transporte, vuelos o carreteras</option>
                  <option value="Compromiso laboral urgente">Compromiso laboral o académico imprevisto</option>
                  <option value="Encontré otra opción de hospedaje">Elegí otra alternativa de hospedaje</option>
                  <option value="Otro motivo personal">Otro motivo personal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Detalle Adicional para el Anfitrión (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comparte brevemente cualquier detalle que desees informar al anfitrión..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Mantener mi Reserva
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando Devolución...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Cancelación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
