import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Receipt, Shield, Copy, Check, X } from 'lucide-react';

interface PagoExitosoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pagoResultado: any;
  codigoCheckin: string;
}

export const PagoExitosoModal: React.FC<PagoExitosoModalProps> = ({
  isOpen,
  onClose,
  pagoResultado,
  codigoCheckin,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pago = pagoResultado?.pago;
  const factura = pago?.comprobantes?.[0];

  const handleCopyPIN = () => {
    navigator.clipboard.writeText(codigoCheckin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Royal Blue & White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-lg my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col p-6 sm:p-8 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          title="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-blue-500/25">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
          RESERVA CONFIRMADA &amp; PAGO ACREDITADO
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          ¡Reserva y Pago Exitosos!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          Tu estancia ha sido confirmada en tiempo real. Se ha emitido tu factura oficial y tu código de acceso seguro.
        </p>

        {/* PIN Check-in Highlight Box */}
        <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-2 border-dashed border-blue-300 dark:border-blue-700/60 mb-5 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Código PIN de Check-in Presencial
              </span>
            </div>
            <button
              onClick={handleCopyPIN}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition shadow-sm font-semibold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-600" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center py-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-blue-600 dark:text-blue-400">
              {codigoCheckin || '256723'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
            Entrega este PIN al anfitrión al momento de tu llegada física para validar tu identidad e ingresar al alojamiento.
          </p>
        </div>

        {/* Invoice & Accounting Details */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-5 text-left">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Factura Oficial SIN:</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {factura?.numero || 'FAC-20261029-EB5933'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Comprobante de Pago:</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {pagoResultado?.asientoContableId ? `Ref: ${pagoResultado.asientoContableId.substring(0, 10).toUpperCase()}` : 'Acreditado vía QR BNB'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700/80">
            <span>Importe Total Cobrado:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {pago?.montoTotal || 1842.75} BOB
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition cursor-pointer"
        >
          Entendido, Ver Mis Reservas
        </button>

      </div>
    </div>
  );
};
