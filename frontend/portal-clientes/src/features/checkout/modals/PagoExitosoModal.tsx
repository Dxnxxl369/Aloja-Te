import React from 'react';
import { CheckCircle, KeyRound, Receipt, Shield, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const pago = pagoResultado?.pago;
  const factura = pago?.comprobantes?.[0];

  const handleCopyPIN = () => {
    navigator.clipboard.writeText(codigoCheckin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Blue Liquid Glass Celebration Container */}
      <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl liquid-glass-blue text-white shadow-2xl z-10 animate-modal-in border border-emerald-500/40 text-center overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-600/30">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
          RESERVA CONFIRMADA &amp; PAGO ACREDITADO
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          ¡Reserva y Pago Exitosos!
        </h3>
        <p className="text-xs text-slate-300 max-w-sm mx-auto mb-6">
          Tu estancia ha sido confirmada en tiempo real. Se ha emitido tu factura oficial y tu código de acceso seguro.
        </p>

        {/* PIN Check-in Highlight Box */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-dashed border-cyan-400/40 mb-6 text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Código PIN de Check-in Presencial
              </span>
            </div>
            <button
              onClick={handleCopyPIN}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center py-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
              {codigoCheckin || '256723'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-1">
            Entrega este PIN al anfitrión al momento de tu llegada física para habilitar el ingreso al alojamiento.
          </p>
        </div>

        {/* Details: SIN Invoice & Double-Entry Accounting */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mb-6 text-left">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Receipt className="w-3.5 h-3.5 text-cyan-400" />
              <span>Factura Oficial SIN:</span>
            </span>
            <span className="font-mono font-bold text-cyan-300">
              {factura?.numero || 'FAC-20261029-EB5933'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Comprobante de Pago:</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold">
              {pagoResultado?.asientoContableId ? `Ref: ${pagoResultado.asientoContableId.substring(0, 10).toUpperCase()}` : 'Acreditado vía QR BNB'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Importe Total Cobrado:</span>
            <span className="font-bold text-white">
              {pago?.montoTotal || 1842.75} BOB
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition"
        >
          Entendido, Ver Mis Reservas
        </button>

      </div>
    </div>
  );
};
