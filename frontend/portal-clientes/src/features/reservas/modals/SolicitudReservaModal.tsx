import React, { useState, useEffect } from 'react';
import { Alojamiento, UnidadReservable } from '../../catalogo/types/catalogo.types';
import { useAuth } from '../../../core/auth/AuthContext';
import { reservasService } from '../services/reservasService';
import { ReservaResponse } from '../types/reserva.types';
import { X, Calendar, Users, ShieldCheck, ArrowRight, Loader2, AlertCircle, Building2, Home } from 'lucide-react';

interface SolicitudReservaModalProps {
  alojamiento: Alojamiento | null;
  unidadPreseleccionada?: UnidadReservable | null;
  onClose: () => void;
  onReservaCreada: (reserva: ReservaResponse) => void;
}

export const SolicitudReservaModal: React.FC<SolicitudReservaModalProps> = ({
  alojamiento,
  unidadPreseleccionada,
  onClose,
  onReservaCreada,
}) => {
  const { user, openAuthModal } = useAuth();
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    unidadPreseleccionada?.idUnidad || alojamiento?.unidades?.[0]?.idUnidad || ''
  );
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-13');
  const [huespedes, setHuespedes] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unidadPreseleccionada?.idUnidad) {
      setSelectedUnidadId(unidadPreseleccionada.idUnidad);
    } else if (alojamiento?.unidades?.[0]?.idUnidad) {
      setSelectedUnidadId(alojamiento.unidades[0].idUnidad);
    }
  }, [unidadPreseleccionada, alojamiento]);

  if (!alojamiento) return null;

  const unidad = alojamiento.unidades.find(u => u.idUnidad === selectedUnidadId) || alojamiento.unidades[0] || {
    idUnidad: '00547b62-d2f5-4aa8-80a5-8662b2e028ec',
    nombre: 'Suite Estándar',
    precioNoche: alojamiento.precioBaseNoche,
    capacidadPersonas: 4,
    inventarioTotal: 1,
  };

  const esHotel = alojamiento.modalidad === 'HOTEL_HOSTAL';

  // Cálculo de noches
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.max(0, date2.getTime() - date1.getTime());
  const noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = noches * unidad.precioNoche;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        idCliente: user?.id || '12e9afda-0a98-4a40-80fb-88794b383a8e',
        nombreCliente: user ? `${user.nombre} ${user.apellido}` : 'Lucia Suarez',
        idAnfitrion: alojamiento.idAnfitrion,
        idAlojamiento: alojamiento.idAlojamiento,
        tituloAlojamiento: alojamiento.titulo,
        idUnidad: unidad.idUnidad,
        nombreUnidad: unidad.nombre,
        checkIn,
        checkOut,
        cantidadHuespedes: huespedes,
        cantidadUnidades: 1,
        precioNoche: unidad.precioNoche,
      };

      const reserva = await reservasService.crearReserva(payload);
      onReservaCreada(reserva);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No fue posible completar la reserva en las fechas solicitadas. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-all duration-300 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Blue Liquid Glass Modal */}
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl liquid-glass-blue text-white shadow-2xl z-10 animate-modal-in border border-cyan-500/30 overflow-hidden">
        
        {/* Decorative ambient blur */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 block mb-1">
              RESERVA EN LÍNEA • CONFIRMACIÓN INMEDIATA
            </span>
            <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
              Configura tu Estadía
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {alojamiento.titulo} — {unidad.nombre}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Selector de Habitación / Oferta Única */}
          {alojamiento.unidades && alojamiento.unidades.length > 1 ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300">Tipo de Habitación / Suite Seleccionada</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedUnidadId}
                  onChange={(e) => setSelectedUnidadId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400 transition"
                >
                  {alojamiento.unidades.map((u) => (
                    <option key={u.idUnidad} value={u.idUnidad} className="bg-slate-900 text-white">
                      {u.nombre} — {u.precioNoche} BOB/noche ({u.inventarioTotal} disp.)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span>Modalidad: <strong className="text-white">{esHotel ? 'Habitación Única' : 'Propiedad Entera (Oferta Exclusiva)'}</strong></span>
              </div>
              <span className="text-brand-300 font-mono font-bold">{unidad.precioNoche} BOB / noche</span>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fecha de Ingreso (Check-in)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Fecha de Salida (Check-out)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Huéspedes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cantidad de Huéspedes</label>
            <div className="relative">
              <Users className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={huespedes}
                onChange={(e) => setHuespedes(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400 transition"
              >
                <option value={1} className="bg-slate-900">1 Huésped</option>
                <option value={2} className="bg-slate-900">2 Huéspedes</option>
                <option value={3} className="bg-slate-900">3 Huéspedes</option>
                <option value={4} className="bg-slate-900">4 Huéspedes</option>
                <option value={5} className="bg-slate-900">5 Huéspedes</option>
              </select>
            </div>
          </div>

          {/* Desglose de Costo */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span>{noches} {noches === 1 ? 'noche' : 'noches'} × {unidad.precioNoche} BOB</span>
              <span className="font-semibold text-white">{subtotal} BOB</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Disponibilidad de fechas:</span>
              <span className="text-emerald-400 font-semibold">Bloqueo Inmediato Garantizado</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-sm text-white">
              <span>Total Estimado:</span>
              <span className="text-xl text-brand-400 font-black">{subtotal} BOB</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Al confirmar, tus fechas quedan reservadas por 15 minutos mientras completas el pago con QR.</span>
          </div>

          {!user ? (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="w-full py-3.5 rounded-xl btn-primary flex items-center justify-center gap-2 text-xs"
              >
                <span>Inicia Sesión para Confirmar tu Reserva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Identifícate como Huésped para asociar las fechas y el PIN de ingreso a tu cuenta.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-primary flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Asegurando fechas de tu estadía...</span>
                </>
              ) : (
                <>
                  <span>Continuar al Pago con QR Simple</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>

      </div>
    </div>
  );
};
