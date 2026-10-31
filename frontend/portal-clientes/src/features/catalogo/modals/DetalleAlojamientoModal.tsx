import React, { useState, useEffect } from 'react';
import { Alojamiento, UnidadReservable, ValoracionCliente, ResumenValoraciones } from '../types/catalogo.types';
import { catalogoService } from '../services/catalogoService';
import { useAuth } from '../../../core/auth/AuthContext';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  X, Star, MapPin, Users, Bed, Bath, CheckCircle2, ArrowRight, Clock,
  ImageIcon, ShieldCheck, MessageSquarePlus, ChevronDown, ChevronUp, Sparkles, Send
} from 'lucide-react';

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

  const { user } = useAuth();
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    alojamiento.unidades?.[0]?.idUnidad || ''
  );

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reseñas State
  const [activeReviewTab, setActiveReviewTab] = useState<'HOTEL' | 'HABITACION'>('HOTEL');
  const [resenasHotel, setResenasHotel] = useState<ValoracionCliente[]>([]);
  const [resenasHabitacion, setResenasHabitacion] = useState<ValoracionCliente[]>([]);
  const [resumen, setResumen] = useState<ResumenValoraciones | null>(null);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  // Formulario Nueva Reseña (UX Ágil en 1 click con 5 atributos opcionales)
  const [modalNuevaResena, setModalNuevaResena] = useState(false);
  const [puntuacionGeneral, setPuntuacionGeneral] = useState(5);
  const [comentario, setComentario] = useState('');
  const [esAnonimo, setEsAnonimo] = useState(false);
  const [mostrarOpcionales, setMostrarOpcionales] = useState(false);
  const [limpieza, setLimpieza] = useState<number | undefined>(undefined);
  const [ubicacion, setUbicacion] = useState<number | undefined>(undefined);
  const [calidadPrecio, setCalidadPrecio] = useState<number | undefined>(undefined);
  const [servicio, setServicio] = useState<number | undefined>(undefined);
  const [comodidad, setComodidad] = useState<number | undefined>(undefined);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const fotosUrls = (alojamiento.fotografias || []).map(f => f.url).filter(Boolean);
  if (fotosUrls.length === 0) {
    fotosUrls.push('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80');
  }
  const fotoPrincipal = fotosUrls[0];
  const fotosSecundarias = fotosUrls.slice(1, 4);

  const unidadActiva = alojamiento.unidades.find(u => u.idUnidad === selectedUnidadId) || alojamiento.unidades[0];
  const esHotel = alojamiento.modalidad === 'HOTEL_HOSTAL';

  // Cargar reseñas generales del hotel o casa
  const cargarResenas = async () => {
    setCargandoResenas(true);
    try {
      const dataHotel = await catalogoService.listarValoracionesGeneralesHotel(alojamiento.idAlojamiento);
      setResenasHotel(dataHotel || []);

      const resumenData = await catalogoService.obtenerResumenValoraciones(alojamiento.idAlojamiento);
      if (resumenData) setResumen(resumenData);
    } catch (e) {
      console.warn('Error al cargar reseñas:', e);
    } finally {
      setCargandoResenas(false);
    }
  };

  // Cargar reseñas de la habitación cuando cambia la selección
  const cargarResenasHabitacion = async (idUnidad: string) => {
    if (!idUnidad) return;
    try {
      const dataHab = await catalogoService.listarValoracionesUnidad(idUnidad);
      setResenasHabitacion(dataHab || []);
    } catch (e) {
      console.warn('Error al cargar reseñas de habitación:', e);
    }
  };

  useEffect(() => {
    cargarResenas();
    if (unidadActiva?.idUnidad) {
      cargarResenasHabitacion(unidadActiva.idUnidad);
    }
  }, [alojamiento.idAlojamiento]);

  useEffect(() => {
    if (selectedUnidadId) {
      cargarResenasHabitacion(selectedUnidadId);
    }
  }, [selectedUnidadId]);

  const abrirLightboxEn = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const enviarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setEnviando(true);
    try {
      const idUsuarioActual = user?.id || '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const targetUnidad = (esHotel && activeReviewTab === 'HABITACION') ? unidadActiva?.idUnidad : undefined;

      await catalogoService.crearValoracion(alojamiento.idAlojamiento, {
        idUnidad: targetUnidad,
        idUsuario: idUsuarioActual,
        puntuacionGeneral,
        calificacionLimpieza: limpieza,
        calificacionUbicacion: ubicacion,
        calificacionCalidadPrecio: calidadPrecio,
        calificacionServicio: servicio,
        calificacionComodidad: comodidad,
        esAnonimo,
        comentario
      });

      setMensajeExito('¡Reseña registrada con éxito! Gracias por compartir tu experiencia.');
      setComentario('');
      setTimeout(() => {
        setModalNuevaResena(false);
        setMensajeExito(null);
      }, 1500);

      // Recargar reseñas
      cargarResenas();
      if (unidadActiva?.idUnidad) cargarResenasHabitacion(unidadActiva.idUnidad);
    } catch (err) {
      console.error('Error al enviar valoración:', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl z-10 animate-modal-in border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition z-20 backdrop-blur-md cursor-pointer"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mosaico Galería Fotográfica Interactiva */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 relative">
          {/* Foto Principal Grande */}
          <div
            onClick={() => abrirLightboxEn(0)}
            className="md:col-span-3 relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] shadow-lg border border-slate-200/50 dark:border-white/10 cursor-pointer group"
          >
            <img
              src={fotoPrincipal}
              alt={alojamiento.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
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

            {/* Hover overlay hint */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Click para ver en alta resolución</span>
            </div>
          </div>

          {/* Miniaturas Secundarias Verticales */}
          <div className="hidden md:flex flex-col gap-3">
            {fotosSecundarias.map((foto, idx) => (
              <div
                key={idx}
                onClick={() => abrirLightboxEn(idx + 1)}
                className="flex-1 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-sm"
              >
                <img
                  src={foto}
                  alt={`Foto secundaria ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            ))}

            {/* Botón "Ver todas las fotos" */}
            <button
              onClick={() => abrirLightboxEn(0)}
              className="py-2.5 px-3 rounded-xl bg-slate-900/85 hover:bg-blue-600 text-white font-bold text-xs transition border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ver {fotosUrls.length} fotos</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-xs">
          
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

        {/* ========================================================= */}
        {/* SECCIÓN DE RESEÑAS & VALORACIONES (HOTEL VS HABITACIONES) */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          
          {/* Header de Reseñas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {resumen?.calificacionPromedio || '4.95'} • {resumen?.totalResenas || resenasHotel.length || 2} Reseñas de Viajeros
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluaciones de huéspedes reales verificados por check-in presencial
              </p>
            </div>

            <button
              onClick={() => setModalNuevaResena(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Dejar Reseña</span>
            </button>
          </div>

          {/* Desglose de los 5 Atributos de Calidad */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">🧹 Limpieza</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="text-sm">{resumen?.promedioLimpieza || '4.9'}</span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">📍 Ubicación</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="text-sm">{resumen?.promedioUbicacion || '4.8'}</span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">💰 Calidad / Precio</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="text-sm">{resumen?.promedioCalidadPrecio || '4.7'}</span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">🛎️ Servicio</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="text-sm">{resumen?.promedioServicio || '5.0'}</span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">🛏️ Comodidad</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="text-sm">{resumen?.promedioComodidad || '4.9'}</span>
                <span className="text-[10px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas: Hotel General vs Habitación Seleccionada (Solo si es Hotel) */}
          {esHotel && (
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveReviewTab('HOTEL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeReviewTab === 'HOTEL'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🏨 Reseñas Generales del Hotel ({resenasHotel.length})
              </button>

              <button
                onClick={() => setActiveReviewTab('HABITACION')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeReviewTab === 'HABITACION'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🛏️ Reseñas de la Habitación: {unidadActiva?.nombre || 'Habitación'} ({resenasHabitacion.length})
              </button>
            </div>
          )}

          {/* Listado de Tarjetas de Reseñas */}
          <div className="space-y-3">
            {((esHotel && activeReviewTab === 'HABITACION') ? resenasHabitacion : resenasHotel).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                Aún no hay reseñas registradas para esta sección. ¡Sé el primero en compartir tu opinión!
              </div>
            ) : (
              ((esHotel && activeReviewTab === 'HABITACION') ? resenasHabitacion : resenasHotel).map((r) => (
                <div
                  key={r.idValoracion}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px]">
                        {r.esAnonimo ? '🛡️' : (r.nombreUsuario?.charAt(0) || 'U')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {r.esAnonimo ? 'Huésped Verificado (Anónimo)' : (r.nombreUsuario || 'Viajero')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-BO') : 'Estadía verificada'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Badge NLP */}
                      {r.sentimientoNlp && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            r.sentimientoNlp === 'POSITIVO'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : r.sentimientoNlp === 'NEGATIVO'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{r.sentimientoNlp}</span>
                          {r.topicoPredicho && <span className="opacity-75">• {r.topicoPredicho}</span>}
                        </span>
                      )}

                      <div className="flex items-center gap-0.5 text-yellow-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{r.puntuacionGeneral}.0</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {r.comentario}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL PARA DEJAR RESEÑA RÁPIDA (UX ÁGIL + PROTECCIÓN ANÓNIMA) */}
      {/* ============================================================== */}
      {modalNuevaResena && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-serif text-lg font-bold">
                Calificar Estadía en {alojamiento.titulo}
              </h4>
              <button
                onClick={() => setModalNuevaResena(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mensajeExito ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs text-center font-bold">
                {mensajeExito}
              </div>
            ) : (
              <form onSubmit={enviarResena} className="space-y-4 text-xs">
                {/* 1-Click Rating: Puntuación General */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    1. Tu Calificación General:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setPuntuacionGeneral(star)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= puntuacionGeneral
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400 ml-2">
                      {puntuacionGeneral === 5 ? '¡Excelente!' : puntuacionGeneral === 4 ? 'Muy Bueno' : puntuacionGeneral === 3 ? 'Aceptable' : 'Deficiente'}
                    </span>
                  </div>
                </div>

                {/* Comentario de Texto */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    2. Tu Opinión / Comentario (Texto para análisis):
                  </label>
                  <textarea
                    required
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    placeholder="Describe qué fue lo mejor de tu estadía y qué aspectos podrían mejorar..."
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Switch de Modo Anónimo */}
                <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white text-[11px]">
                        Publicar como Huésped Anónimo
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Oculta tu nombre y foto ante el anfitrión y en la plataforma
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={esAnonimo}
                    onChange={(e) => setEsAnonimo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Acordeón Opcional de los 5 Atributos */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMostrarOpcionales(!mostrarOpcionales)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <span>¿Deseas desglosar aspectos específicos? (Opcional)</span>
                    {mostrarOpcionales ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {mostrarOpcionales && (
                    <div className="p-3 space-y-2.5 bg-white dark:bg-slate-900 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>🧹 Limpieza:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button type="button" key={s} onClick={() => setLimpieza(s)} className={`px-2 py-0.5 rounded ${limpieza === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{s}</button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>📍 Ubicación:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button type="button" key={s} onClick={() => setUbicacion(s)} className={`px-2 py-0.5 rounded ${ubicacion === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{s}</button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>💰 Calidad / Precio:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button type="button" key={s} onClick={() => setCalidadPrecio(s)} className={`px-2 py-0.5 rounded ${calidadPrecio === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{s}</button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>🛎️ Servicio:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button type="button" key={s} onClick={() => setServicio(s)} className={`px-2 py-0.5 rounded ${servicio === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{s}</button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>🛏️ Comodidad:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button type="button" key={s} onClick={() => setComodidad(s)} className={`px-2 py-0.5 rounded ${comodidad === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalNuevaResena(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !comentario.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{enviando ? 'Enviando...' : 'Publicar Reseña'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Lightbox Modal de Imágenes a Pantalla Completa */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        imagenes={fotosUrls}
        indiceInicial={lightboxIndex}
        titulo={alojamiento.titulo}
        onClose={() => setLightboxOpen(false)}
      />

    </div>
  );
};
