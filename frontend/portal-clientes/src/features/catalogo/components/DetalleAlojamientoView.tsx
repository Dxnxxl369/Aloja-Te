import React, { useState } from 'react';
import { 
  ArrowLeft, Star, MapPin, Users, Bed, Bath, Sparkles, Check, 
  ShieldCheck, Clock, Calendar, ArrowRight, Share2, Heart, 
  Hotel, Home, Building2, CheckCircle2, ChevronRight, Eye
} from 'lucide-react';
import { Alojamiento, UnidadReservable } from '../types/catalogo.types';

interface DetalleAlojamientoViewProps {
  alojamiento: Alojamiento;
  onVolver: () => void;
  onReservar: (alojamiento: Alojamiento, unidadSeleccionada: UnidadReservable, checkIn: string, checkOut: string, huespedes: number) => void;
}

export const DetalleAlojamientoView: React.FC<DetalleAlojamientoViewProps> = ({
  alojamiento,
  onVolver,
  onReservar,
}) => {
  // Estado de la unidad seleccionada (especialmente relevante para Hoteles)
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    alojamiento.unidades?.[0]?.idUnidad || ''
  );

  // Fechas y Huéspedes en el widget lateral
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-13');
  const [huespedes, setHuespedes] = useState(2);
  const [fotoModalOpen, setFotoModalOpen] = useState(false);

  const esHotel = alojamiento.modalidad === 'HOTEL_HOSTAL';
  const unidadActiva = alojamiento.unidades?.find(u => u.idUnidad === selectedUnidadId) || alojamiento.unidades?.[0] || {
    idUnidad: 'u-def',
    nombre: 'Alojamiento Completo',
    capacidadPersonas: 4,
    cantidadCamas: 2,
    cantidadBanios: 1,
    inventarioTotal: 1,
    precioNoche: alojamiento.precioBaseNoche,
    moneda: 'BOB',
    activo: true,
  };

  // Cálculo dinámico de noches y subtotal
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.max(0, date2.getTime() - date1.getTime());
  const noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const precioNocheActual = unidadActiva.precioNoche || alojamiento.precioBaseNoche;
  const subtotal = noches * precioNocheActual;
  const cargoServicio = Math.round(subtotal * 0.05);
  const totalEstimado = subtotal + cargoServicio;

  // Galería de fotos estilo Airbnb (1 hero + 4 laterales)
  const fotos = alojamiento.fotografias && alojamiento.fotografias.length > 0 
    ? alojamiento.fotografias 
    : [
        { idFotografia: '1', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', esPrincipal: true, orden: 1 },
        { idFotografia: '2', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80', esPrincipal: false, orden: 2 },
        { idFotografia: '3', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', esPrincipal: false, orden: 3 },
        { idFotografia: '4', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', esPrincipal: false, orden: 4 },
        { idFotografia: '5', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', esPrincipal: false, orden: 5 },
      ];

  const heroFoto = fotos.find(f => f.esPrincipal) || fotos[0];
  const sideFotos = fotos.filter(f => f.idFotografia !== heroFoto.idFotografia).slice(0, 4);

  // Lista de servicios
  const servicios = alojamiento.servicios && alojamiento.servicios.length > 0
    ? alojamiento.servicios
    : [
        { idServicio: 1, nombre: 'Wifi de Alta Velocidad (Starlink)', categoria: 'CONECTIVIDAD' },
        { idServicio: 2, nombre: 'Piscina Privada con Solarium', categoria: 'CONFORT' },
        { idServicio: 3, nombre: 'Aire Acondicionado', categoria: 'CLIMATIZACION' },
        { idServicio: 4, nombre: 'Cocina Equipada con Desayunador', categoria: 'SERVICIOS' },
        { idServicio: 5, nombre: 'Estacionamiento Gratuito', categoria: 'ACCESIBILIDAD' },
        { idServicio: 6, nombre: 'Parrillera / Churrasquera Privada', categoria: 'CONFORT' },
      ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      
      {/* 1. Barra Superior de Retorno & Breadcrumbs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={onVolver}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Volver a Alojamientos en Bolivia</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span>Bolivia</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{alojamiento.departamento}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{alojamiento.ciudad}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{alojamiento.titulo}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              esHotel 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {esHotel ? '🏨 Hotel / Hostal' : '🏡 Casa / Depto Entero'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* 2. Título, Calificación y Ubicación */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {alojamiento.tipoPropiedad || 'Alojamiento Tradicional'}
            </span>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{alojamiento.calificacionPromedio ? alojamiento.calificacionPromedio.toFixed(2) : '4.95'}</span>
              <span className="text-slate-400 font-normal">({alojamiento.totalResenas || 24} reseñas verificadas)</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {alojamiento.titulo}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{alojamiento.direccion ? `${alojamiento.direccion}, ` : ''}{alojamiento.ciudad}, Departamento de {alojamiento.departamento}, Bolivia</span>
          </p>
        </div>

        {/* 3. Galería Panorámica de Fotos Estilo Airbnb (5 Fotos) */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[340px] sm:h-[420px] lg:h-[480px]">
            {/* Foto Hero Principal */}
            <div className="relative md:col-span-2 md:row-span-2 h-full w-full overflow-hidden group cursor-pointer">
              <img
                src={heroFoto.url}
                alt={alojamiento.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-md">
                ⭐ Portada Principal
              </span>
            </div>

            {/* 4 Fotos Secundarias */}
            {sideFotos.map((foto, idx) => (
              <div key={foto.idFotografia || idx} className="hidden md:block relative h-full w-full overflow-hidden group cursor-pointer">
                <img
                  src={foto.url}
                  alt={`${alojamiento.titulo} foto ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 right-4">
            <span className="px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md transition shadow-md">
              📸 {fotos.length} fotografías en alta resolución
            </span>
          </div>
        </div>

        {/* 4. Layout Principal en 2 Columnas (65% Info y Habitaciones | 35% Widget Reserva) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* COLUMNA IZQUIERDA (Info, Habitaciones, Servicios, Políticas) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Anfitrión & Características Rápidas */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20">
                  {alojamiento.nombreAnfitrion ? alojamiento.nombreAnfitrion.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Anfitrión: {alojamiento.nombreAnfitrion || 'Carlos Mendoza'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                      Verificado SEGIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Responde habitualmente en menos de 15 minutos • Identidad y cuenta BNB auditadas
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 border-l border-slate-100 dark:border-slate-800 pl-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-white text-base">
                    {unidadActiva.capacidadPersonas || 4}
                  </span>
                  <span>Huéspedes</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-white text-base">
                    {unidadActiva.cantidadCamas || 2}
                  </span>
                  <span>Camas</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-slate-900 dark:text-white text-base">
                    {unidadActiva.cantidadBanios || 2}
                  </span>
                  <span>Baños</span>
                </div>
              </div>
            </div>

            {/* Descripción Completa */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Acerca de esta experiencia
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {alojamiento.descripcion}
              </p>
            </div>

            {/* SECCIÓN ESPECIAL PARA HOTELES: CATÁLOGO EXPANDIDO DE HABITACIONES */}
            {esHotel && alojamiento.unidades && alojamiento.unidades.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                      Habitaciones Disponibles en el Hotel ({alojamiento.unidades.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Selecciona la categoría que mejor se ajuste a tu viaje. Cada habitación tiene su propio inventario.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                    Inventario en Tiempo Real
                  </span>
                </div>

                <div className="space-y-4">
                  {alojamiento.unidades.map((unidad) => {
                    const esSeleccionada = unidad.idUnidad === selectedUnidadId;
                    return (
                      <div
                        key={unidad.idUnidad}
                        onClick={() => setSelectedUnidadId(unidad.idUnidad)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                          esSeleccionada
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-md shadow-blue-600/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <img
                            src={heroFoto.url}
                            alt={unidad.nombre}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {unidad.nombre}
                              </h4>
                              {esSeleccionada && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                                  Seleccionada
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.capacidadPersonas} Huéspedes
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.cantidadCamas} Camas
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.cantidadBanios || 1} Baño privado
                              </span>
                            </div>

                            <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ {unidad.inventarioTotal || 2} unidades disponibles con confirmación inmediata
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                          <div className="sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa por Noche</span>
                            <div className="flex items-baseline gap-1">
                              <span className="font-black text-xl text-slate-900 dark:text-white">
                                {unidad.precioNoche}
                              </span>
                              <span className="text-xs font-bold text-blue-600">
                                BOB
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`mt-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                              esSeleccionada
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            {esSeleccionada ? '✓ Elegida' : 'Elegir habitación'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matriz de Amenidades & Servicios */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Lo que este lugar ofrece
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {servicios.map((s) => (
                  <div
                    key={s.idServicio || s.nombre}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>{s.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Políticas y Reglas de Estadía */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Normas de convivencia y horarios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Horarios Oficiales</span>
                  </div>
                  <p>Check-in (Entrada): <span className="font-bold text-slate-900 dark:text-white">{alojamiento.horarioEntrada || '14:00'}</span></p>
                  <p>Check-out (Salida): <span className="font-bold text-slate-900 dark:text-white">{alojamiento.horarioSalida || '11:00'}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Políticas del Anfitrión</span>
                  </div>
                  <p className="leading-relaxed">
                    {alojamiento.politicas || 'Ambiente familiar respetuoso. Prohibido fumar en dormitorios. Se solicita cuidado del equipamiento y llaves.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA (Widget Flotante de Reserva & Checkout) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              {/* Encabezado del precio */}
              <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa por Noche</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-black text-slate-900 dark:text-white">
                      Bs. {precioNocheActual}
                    </span>
                    <span className="text-xs font-bold text-blue-600">BOB</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    ✓ Sin comisiones ocultas
                  </span>
                  <span className="text-xs text-slate-400">por noche</span>
                </div>
              </div>

              {/* Unidad elegida si es hotel */}
              {esHotel && (
                <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Habitación seleccionada:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                    {unidadActiva.nombre}
                  </span>
                </div>
              )}

              {/* Formulario de Fechas */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-full"
                    />
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-800 pl-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-full"
                    />
                  </div>
                </div>

                {/* Huéspedes */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Viajeros</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{huespedes} Huéspedes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHuespedes(Math.max(1, huespedes - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    >-</button>
                    <button
                      type="button"
                      onClick={() => setHuespedes(Math.min(unidadActiva.capacidadPersonas || 6, huespedes + 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Desglose de Precios Transparente */}
              <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Bs. {precioNocheActual} × {noches} noches</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Bs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifa de servicio y seguro</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Bs. {cargoServicio}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                  <span>Total Estimado</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-base">Bs. {totalEstimado} BOB</span>
                </div>
              </div>

              {/* Botón Principal de Reserva */}
              <button
                type="button"
                onClick={() => onReservar(alojamiento, unidadActiva, checkIn, checkOut, huespedes)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Reservar con QR Simple</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Bloqueo instantáneo en inventario de Bolivia y pago protegido por BNB.</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};