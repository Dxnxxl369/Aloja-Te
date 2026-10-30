import React, { useState } from 'react';
import { Alojamiento, UnidadReservable } from '../types/catalogo.types';
import { X, Star, MapPin, Users, Bed, Bath, CheckCircle2, ArrowRight, Clock, ShieldAlert } from 'lucide-react';

interface DetalleAlojamientoModalProps {
  alojamiento: Alojamiento | null;
  onClose: () => void;
  onIniciarReserva: (alojamiento: Alojamiento, unidad?: UnidadReservable) => void;
}

export const DetalleAlojamientoModal: React.FC<DetalleAlojamientoModalProps> = ({
  alojamiento,
  onClose,
  onIniciarReserva,
}) => {
  if (!alojamiento) return null;

  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    alojamiento.unidades?.[0]?.idUnidad || ''
  );

  const fotoPrincipal = alojamiento.fotografias[0]?.url ||
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';

  const unidadActiva = alojamiento.unidades.find(u => u.idUnidad === selectedUnidadId) || alojamiento.unidades[0];
  const esHotel = alojamiento.modalidad === 'HOTEL_HOSTAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Blue Liquid Glass Modal Container */}
      <div className="relative w-full max-w-4xl my-8 p-6 sm:p-8 rounded-3xl liquid-glass-blue text-white shadow-2xl z-10 animate-modal-in border border-cyan-500/30 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white transition z-20 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Photo Gallery Banner */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6 shadow-lg border border-white/10">
          <img
            src={fotoPrincipal}
            alt={alojamiento.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-brand-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md inline-block">
                  {(alojamiento.tipoPropiedad || 'Alojamiento').replace('_', ' ')}
                </span>
                
                {esHotel ? (
                  <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-indigo-100 text-[11px] font-bold backdrop-blur-md inline-block border border-indigo-400/30">
                    🏨 Hotel / Hostal (Múltiples Habitaciones)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-emerald-100 text-[11px] font-bold backdrop-blur-md inline-block border border-emerald-400/30">
                    🏡 Casa / Depto Entero (Oferta Única)
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {alojamiento.titulo}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{alojamiento.direccion}, {alojamiento.ciudad} - {alojamiento.departamento}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold shrink-0">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {typeof alojamiento.calificacionPromedio === 'number'
                  ? alojamiento.calificacionPromedio.toFixed(2)
                  : '4.95'}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 text-xs">
          
          {/* Left Column: Description, Rooms & Services */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] mb-2">Acerca del Alojamiento</h4>
              <p className="text-slate-200 leading-relaxed text-xs font-normal">
                {alojamiento.descripcion}
              </p>
            </div>

            {/* Selector de Habitaciones si es Hotel/Hostal */}
            {esHotel && alojamiento.unidades && alojamiento.unidades.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    Selecciona tu Tipo de Habitación
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {alojamiento.unidades.length} opciones disponibles
                  </span>
                </div>

                <div className="space-y-2.5">
                  {alojamiento.unidades.map((u) => {
                    const isSelected = (unidadActiva?.idUnidad === u.idUnidad);
                    return (
                      <div
                        key={u.idUnidad}
                        onClick={() => setSelectedUnidadId(u.idUnidad)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-brand-950/70 border-brand-400 shadow-md shadow-brand-500/20'
                            : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs">{u.nombre}</span>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                                {u.inventarioTotal} disponibles
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-cyan-400" />
                                {u.capacidadPersonas} huéspedes
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-cyan-400" />
                                {u.cantidadCamas} camas
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-cyan-400" />
                                {u.cantidadBanios} baño
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-base font-bold text-brand-300">{u.precioNoche} BOB</span>
                            <span className="block text-[10px] text-slate-400">/ noche</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Políticas y Horarios */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Check-in: <strong className="text-white">{alojamiento.horarioEntrada || '14:00'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Check-out: <strong className="text-white">{alojamiento.horarioSalida || '11:00'}</strong></span>
                </div>
              </div>

              {alojamiento.politicas && (
                <p className="text-[11px] text-slate-300 pt-1.5 border-t border-slate-800">
                  <strong className="text-cyan-300">Normas del Hospedaje:</strong> {alojamiento.politicas}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] mb-2">Servicios &amp; Amenidades</h4>
              <div className="grid grid-cols-2 gap-2">
                {alojamiento.servicios.map((s) => (
                  <div key={s.idServicio} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{s.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {alojamiento.nombreAnfitrion && (
              <div className="p-3 rounded-2xl bg-slate-900/50 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Anfitrión Responsable</span>
                  <span className="text-xs font-bold text-white">{alojamiento.nombreAnfitrion}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  Verificado
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Units & Booking Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {esHotel ? 'Habitación Elegida' : 'Propiedad Seleccionada'}
              </span>
              <h5 className="font-serif text-lg font-bold text-white mb-2">
                {unidadActiva?.nombre || alojamiento.unidades[0]?.nombre || 'Hospedaje Completo'}
              </h5>
              
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Capacidad: {unidadActiva?.capacidadPersonas || 4} personas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Camas: {unidadActiva?.cantidadCamas || 2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Baños: {unidadActiva?.cantidadBanios || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-300 font-medium">
                    {esHotel
                      ? `${unidadActiva?.inventarioTotal || 1} unidades disponibles`
                      : 'Oferta exclusiva (1 unidad única)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-slate-400 text-xs">Tarifa por noche:</span>
                <span className="text-2xl font-black text-white">
                  {unidadActiva?.precioNoche ?? alojamiento.precioBaseNoche ?? 650} <span className="text-xs text-brand-400">BOB</span>
                </span>
              </div>

              <button
                onClick={() => onIniciarReserva(alojamiento, unidadActiva)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Configurar Reserva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
