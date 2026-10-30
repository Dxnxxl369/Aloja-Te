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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Royal Blue & White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-4xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl z-10 animate-modal-in border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition z-20 backdrop-blur-md"
          title="Cerrar modal"
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
                <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md inline-block">
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
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
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
              <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">Acerca del Alojamiento</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-normal">
                {alojamiento.descripcion}
              </p>
            </div>

            {/* Selector de Habitaciones si es Hotel/Hostal */}
            {esHotel && alojamiento.unidades && alojamiento.unidades.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px]">
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
                            ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white text-xs">{u.nombre}</span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                {u.inventarioTotal} disponibles
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {u.capacidadPersonas} huéspedes
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {u.cantidadCamas} camas
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                {u.cantidadBanios} baño
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">{u.precioNoche} BOB</span>
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
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Check-in: <strong className="text-slate-900 dark:text-white">{alojamiento.horarioEntrada || '14:00'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Check-out: <strong className="text-slate-900 dark:text-white">{alojamiento.horarioSalida || '11:00'}</strong></span>
                </div>
              </div>

              {alojamiento.politicas && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-700/80">
                  <strong className="text-blue-600 dark:text-blue-400">Normas del Hospedaje:</strong> {alojamiento.politicas}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">Servicios &amp; Amenidades</h4>
              <div className="grid grid-cols-2 gap-2">
                {alojamiento.servicios.map((s) => (
                  <div key={s.idServicio} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{s.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {alojamiento.nombreAnfitrion && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Anfitrión Responsable</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{alojamiento.nombreAnfitrion}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  Verificado
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Units & Booking Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {esHotel ? 'Habitación Elegida' : 'Propiedad Seleccionada'}
              </span>
              <h5 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-2">
                {unidadActiva?.nombre || alojamiento.unidades[0]?.nombre || 'Hospedaje Completo'}
              </h5>
              
              <div className="space-y-2 text-slate-600 dark:text-slate-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Capacidad: {unidadActiva?.capacidadPersonas || 4} personas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Camas: {unidadActiva?.cantidadCamas || 2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Baños: {unidadActiva?.cantidadBanios || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {esHotel
                      ? `${unidadActiva?.inventarioTotal || 1} unidades disponibles`
                      : 'Oferta exclusiva (1 unidad única)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Tarifa por noche:</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {unidadActiva?.precioNoche ?? alojamiento.precioBaseNoche ?? 650} <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">BOB</span>
                </span>
              </div>

              <button
                onClick={() => onIniciarReserva(alojamiento, unidadActiva)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
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
