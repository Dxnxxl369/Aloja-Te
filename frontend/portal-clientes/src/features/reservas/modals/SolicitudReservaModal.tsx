import React, { useState, useEffect } from 'react';
import { Alojamiento, UnidadReservable } from '../../catalogo/types/catalogo.types';
import { useAuth } from '../../../core/auth/AuthContext';
import { reservasService } from '../services/reservasService';
import { ReservaResponse } from '../types/reserva.types';
import { X, Calendar, Users, ShieldCheck, ArrowRight, Loader2, AlertCircle, Building2, Home, CheckCircle2 } from 'lucide-react';

interface SolicitudReservaModalProps {
  alojamiento: Alojamiento | null;
  unidadPreseleccionada?: UnidadReservable | null;
  fechasIniciales?: {
    checkIn: string;
    checkOut: string;
    huespedes: number;
  } | null;
  onClose: () => void;
  onReservaCreada: (reserva: ReservaResponse) => void;
}

export const SolicitudReservaModal: React.FC<SolicitudReservaModalProps> = ({
  alojamiento,
  unidadPreseleccionada,
  fechasIniciales,
  onClose,
  onReservaCreada,
}) => {
  const { user, openAuthModal } = useAuth();
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    unidadPreseleccionada?.idUnidad || alojamiento?.unidades?.[0]?.idUnidad || ''
  );
  const [checkIn, setCheckIn] = useState(fechasIniciales?.checkIn || '2026-11-10');
  const [checkOut, setCheckOut] = useState(fechasIniciales?.checkOut || '2026-11-13');
  const [huespedes, setHuespedes] = useState(fechasIniciales?.huespedes || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unidadPreseleccionada?.idUnidad) {
      setSelectedUnidadId(unidadPreseleccionada.idUnidad);
    } else if (alojamiento?.unidades?.[0]?.idUnidad) {
      setSelectedUnidadId(alojamiento.unidades[0].idUnidad);
    }
  }, [unidadPreseleccionada, alojamiento]);

  useEffect(() => {
    if (fechasIniciales) {
      if (fechasIniciales.checkIn) setCheckIn(fechasIniciales.checkIn);
      if (fechasIniciales.checkOut) setCheckOut(fechasIniciales.checkOut);
      if (fechasIniciales.huespedes) setHuespedes(fechasIniciales.huespedes);
    }
  }, [fechasIniciales]);

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

    // Validación de sesión real
    if (!user) {
      openAuthModal('login');
      setError('Por favor inicia sesión con tu cuenta para confirmar la reserva y obtener tu PIN de Check-in.');
      return;
    }

    if (user.id === alojamiento.idAnfitrion) {
      setError('Eres el anfitrión de este alojamiento. No es posible reservar tus propias propiedades.');
      return;
    }

    setLoading(true);

    try {
      const disp = await reservasService.verificarDisponibilidad(unidad.idUnidad, checkIn, checkOut);
      if (!disp.disponible) {
        setError(`Esta habitación ya se encuentra reservada del ${checkIn} al ${checkOut}. Por favor selecciona otro rango de fechas.`);
        setLoading(false);
        return;
      }

      const payload = {
        idCliente: user.id,
        nombreCliente: `${user.nombre} ${user.apellido}`.trim() || user.nombre || 'Huésped Registrado',
        idAnfitrion: alojamiento.idAnfitrion,
        nombreAnfitrion: alojamiento.nombreAnfitrion || 'Carlos Mendoza',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Royal Blue & White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-xl my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col">
        
        {/* Header con Badge Circular y Barra de Progreso Azul */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  RESERVA EN LÍNEA • PASO 1 DE 2
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Configura tu Estadía
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {alojamiento.titulo} • {unidad.nombre}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Bar - 50% width */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-600 transition-all duration-300 w-1/2" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Identidad del Huésped (Sesión Verificada) */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Huésped Autenticado</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user.nombre} {user.apellido}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] ml-1.5">({user.email})</span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                Verificado
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Inicia sesión para vincular tu reserva y recibir tu PIN de Check-in.</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shrink-0 self-start sm:self-auto cursor-pointer shadow-sm shadow-blue-500/20"
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Selector de Habitación / Modalidad */}
            {alojamiento.unidades && alojamiento.unidades.length > 1 ? (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipo de Habitación / Suite Seleccionada
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedUnidadId}
                    onChange={(e) => setSelectedUnidadId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {alojamiento.unidades.map((u) => (
                      <option key={u.idUnidad} value={u.idUnidad} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {u.nombre} — {u.precioNoche} BOB/noche ({u.inventarioTotal} disponibles)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Modalidad: <strong className="text-slate-900 dark:text-white">{esHotel ? 'Habitación Única' : 'Propiedad Entera Exclusiva'}</strong></span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{unidad.precioNoche} BOB / noche</span>
              </div>
            )}

            {/* Fechas Check-in & Check-out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Fecha de Ingreso (Check-in)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Fecha de Salida (Check-out)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Huéspedes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad de Huéspedes
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value={1} className="bg-white dark:bg-slate-900">1 Huésped</option>
                  <option value={2} className="bg-white dark:bg-slate-900">2 Huéspedes</option>
                  <option value={3} className="bg-white dark:bg-slate-900">3 Huéspedes</option>
                  <option value={4} className="bg-white dark:bg-slate-900">4 Huéspedes</option>
                  <option value={5} className="bg-white dark:bg-slate-900">5+ Huéspedes</option>
                </select>
              </div>
            </div>

            {/* Desglose de Costo */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 text-slate-600 dark:text-slate-300 text-xs">
              <div className="flex justify-between items-center">
                <span>{noches} {noches === 1 ? 'noche' : 'noches'} × {unidad.precioNoche} BOB</span>
                <span className="font-semibold text-slate-900 dark:text-white">{subtotal} BOB</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                <span>Disponibilidad inmediata:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bloqueo temporal garantizado
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex justify-between items-baseline font-bold text-slate-900 dark:text-white">
                <span>Total Estimado:</span>
                <span className="text-2xl text-blue-600 dark:text-blue-400 font-black font-mono">{subtotal} BOB</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Al continuar, tus fechas quedan reservadas temporalmente (15 min) mientras realizas el pago por QR.</span>
            </div>

            {!user ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Inicia Sesión para Confirmar tu Reserva</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Identifícate como Huésped para asociar las fechas y el PIN de check-in a tu cuenta.
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Asegurando fechas en el sistema...</span>
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
    </div>
  );
};
