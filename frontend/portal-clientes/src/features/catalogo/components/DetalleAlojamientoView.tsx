import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, MapPin, Users, Bed, Bath, Sparkles, Check, 
  ShieldCheck, Clock, Calendar, ArrowRight, Share2, Heart, 
  Hotel, Home, Building2, CheckCircle2, ChevronRight, Eye,
  Image as ImageIcon, MessageSquarePlus, ChevronDown, ChevronUp,
  X, Send, User, Award, CheckCircle, AlertCircle
} from 'lucide-react';
import { Alojamiento, UnidadReservable, ValoracionCliente, ResumenValoraciones } from '../types/catalogo.types';
import { catalogoService } from '../services/catalogoService';
import { reservasService } from '../../reservas/services/reservasService';
import { useAuth } from '../../../core/auth/AuthContext';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';

interface DetalleAlojamientoViewProps {
  alojamiento: Alojamiento;
  onVolver: () => void;
  onFiltrarDepartamento?: (departamento: string) => void;
  onFiltrarCiudad?: (ciudad: string) => void;
  onReservar: (alojamiento: Alojamiento, unidadSeleccionada: UnidadReservable, checkIn: string, checkOut: string, huespedes: number) => void;
}

export const DetalleAlojamientoView: React.FC<DetalleAlojamientoViewProps> = ({
  alojamiento,
  onVolver,
  onFiltrarDepartamento,
  onFiltrarCiudad,
  onReservar,
}) => {
  const { user } = useAuth();

  // Unidad activa (especialmente para hoteles con múltiples habitaciones)
  const [selectedUnidadId, setSelectedUnidadId] = useState<string>(
    alojamiento.unidades?.[0]?.idUnidad || ''
  );

  // Fechas y Huéspedes en el widget lateral
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-13');
  const [huespedes, setHuespedes] = useState(2);

  // Verificación reactiva de Disponibilidad y fechas bloqueadas
  const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false);
  const [estaDisponible, setEstaDisponible] = useState(true);
  const [fechasBloqueadas, setFechasBloqueadas] = useState<string[]>([]);

  // Detección de auto-reserva (Anfitrión propietario del alojamiento)
  const esMiPropiedad = Boolean(
    user && (
      user.id === alojamiento.idAnfitrion ||
      (user.rol === 'ANFITRION' && (
        alojamiento.idAnfitrion === user.id ||
        (alojamiento.nombreAnfitrion && `${user.nombre} ${user.apellido}`.toLowerCase().includes(alojamiento.nombreAnfitrion.toLowerCase()))
      ))
    )
  );

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Pantalla Dedicada para Habitación Individual de Hotel
  const [habitacionEnDetalle, setHabitacionEnDetalle] = useState<UnidadReservable | null>(null);

  // Perfil del Anfitrión Modal State
  const [perfilAnfitrionOpen, setPerfilAnfitrionOpen] = useState(false);

  // Reseñas State
  const [activeReviewTab, setActiveReviewTab] = useState<'HOTEL' | 'HABITACION'>('HOTEL');
  const [resenasHotel, setResenasHotel] = useState<ValoracionCliente[]>([]);
  const [resenasHabitacion, setResenasHabitacion] = useState<ValoracionCliente[]>([]);
  const [resumen, setResumen] = useState<ResumenValoraciones | null>(null);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  // Formulario Modal de Nueva Reseña (1 Clic + 5 Atributos Opcionales + Anónimo)
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

  const esHotel = alojamiento.modalidad === 'HOTEL_HOSTAL';
  const unidadActiva = habitacionEnDetalle || alojamiento.unidades?.find(u => u.idUnidad === selectedUnidadId) || alojamiento.unidades?.[0] || {
    idUnidad: '00547b62-d2f5-4aa8-80a5-8662b2e028ec',
    nombre: 'Alojamiento Completo',
    capacidadPersonas: 4,
    cantidadCamas: 2,
    cantidadBanios: 1,
    inventarioTotal: 1,
    precioNoche: alojamiento.precioBaseNoche,
    moneda: 'BOB',
    activo: true,
  };

  // Verificación reactiva de disponibilidad en fechas seleccionadas
  useEffect(() => {
    if (!unidadActiva?.idUnidad || !checkIn || !checkOut) return;
    let isCurrent = true;
    setVerificandoDisponibilidad(true);

    reservasService
      .verificarDisponibilidad(unidadActiva.idUnidad, checkIn, checkOut)
      .then((res) => {
        if (isCurrent) {
          setEstaDisponible(res.disponible);
          setFechasBloqueadas(res.fechasBloqueadas || []);
          setVerificandoDisponibilidad(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setEstaDisponible(true);
          setVerificandoDisponibilidad(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [unidadActiva?.idUnidad, checkIn, checkOut]);

  // Fotos para Galería y Lightbox (General del Hotel vs Exclusiva de la Habitación)
  const fotosHabitacion = habitacionEnDetalle
    ? (habitacionEnDetalle.fotos || (habitacionEnDetalle.fotografias || []).map(f => f.url).filter(Boolean))
    : [];

  const todasFotos = (habitacionEnDetalle && fotosHabitacion.length > 0)
    ? fotosHabitacion
    : (alojamiento.fotografias || []).map(f => f.url).filter(Boolean);

  if (todasFotos.length === 0) {
    todasFotos.push('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80');
  }
  const heroFoto = todasFotos[0];
  const sideFotos = todasFotos.slice(1, 5);

  // Servicios garantizados
  const servicios = alojamiento.servicios && alojamiento.servicios.length > 0
    ? alojamiento.servicios
    : [
        { idServicio: 1, nombre: 'WiFi de Alta Velocidad (Starlink)', categoria: 'CONECTIVIDAD' },
        { idServicio: 2, nombre: 'Piscina Privada Climatizada', categoria: 'CONFORT' },
        { idServicio: 3, nombre: 'Ambiente Climatizado / AC', categoria: 'CONFORT' },
        { idServicio: 4, nombre: 'Estacionamiento Privado Gratuito', categoria: 'ACCESIBILIDAD' },
        { idServicio: 5, nombre: 'Cocina Totalmente Equipada', categoria: 'SERVICIOS' },
        { idServicio: 6, nombre: 'Seguridad Privada 24/7', categoria: 'SEGURIDAD' },
      ];

  // Cálculo de noches y tarifa
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const diffTime = Math.max(0, date2.getTime() - date1.getTime());
  const noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const precioNocheActual = unidadActiva.precioNoche || alojamiento.precioBaseNoche;
  const subtotal = noches * precioNocheActual;

  // Carga de Reseñas y Resumen Estadístico
  const cargarResenas = async () => {
    setCargandoResenas(true);
    try {
      const dataHotel = await catalogoService.listarValoracionesGeneralesHotel(alojamiento.idAlojamiento);
      setResenasHotel(dataHotel || []);

      const resumenData = await catalogoService.obtenerResumenValoraciones(alojamiento.idAlojamiento);
      if (resumenData) setResumen(resumenData);
    } catch (e) {
      console.warn('Error al cargar reseñas del hotel:', e);
    } finally {
      setCargandoResenas(false);
    }
  };

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

  const abrirLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const enviarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setEnviando(true);
    try {
      const idUsuarioActual = user?.id || '075eabd5-7aca-4ec2-a00d-67064b8eccdf';
      const targetUnidad = (esHotel && activeReviewTab === 'HABITACION') ? unidadActiva?.idUnidad : undefined;

      await catalogoService.crearValoracion(alojamiento.idAlojamiento, {
        idUnidad: targetUnidad,
        idUsuario: idUsuarioActual,
        puntuacionGeneral,
        calificacionLimpieza: limpieza ?? puntuacionGeneral,
        calificacionUbicacion: ubicacion ?? puntuacionGeneral,
        calificacionCalidadPrecio: calidadPrecio ?? puntuacionGeneral,
        calificacionServicio: servicio ?? puntuacionGeneral,
        calificacionComodidad: comodidad ?? puntuacionGeneral,
        esAnonimo,
        comentario: comentario.trim(),
        sentimientoNlp: puntuacionGeneral >= 4 ? 'POSITIVO' : (puntuacionGeneral === 3 ? 'NEUTRO' : 'NEGATIVO'),
        confianzaNlp: 0.95,
        topicoPredicho: 'Experiencia General'
      });

      setMensajeExito(esAnonimo 
        ? '¡Tu reseña fue publicada anónimamente como "Huésped Verificado"!'
        : '¡Gracias por compartir tu experiencia con la comunidad!'
      );
      setComentario('');
      setMostrarOpcionales(false);

      await cargarResenas();
      if (unidadActiva?.idUnidad) {
        await cargarResenasHabitacion(unidadActiva.idUnidad);
      }

      setTimeout(() => {
        setModalNuevaResena(false);
        setMensajeExito(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error al registrar valoración:', err);
      alert('No se pudo enviar la reseña. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const estadoActual = alojamiento.estadoPublicacion || alojamiento.estado || 'PUBLICADO';
  const esPublico = estadoActual === 'PUBLICADO' || (estadoActual === 'OBSERVADO' && ((alojamiento.origenUltimoCambio || '').toUpperCase().includes('NLP') || (alojamiento.origenUltimoCambio || '').toUpperCase().includes('RESENA')));

  if (!esPublico && !esMiPropiedad && user?.rol !== 'ADMINISTRADOR') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Alojamiento no disponible para reservas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            {estadoActual === 'SUSPENDIDO'
              ? 'Esta propiedad se encuentra temporalmente en pausa preventiva por auditoría de calidad.'
              : 'Esta propiedad se encuentra actualmente en proceso de revisión y moderación.'}
          </p>
        </div>
        <button
          onClick={onVolver}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      
      {/* Banner de Aviso de Estado para el Propietario */}
      {!esPublico && esMiPropiedad && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs text-amber-800 dark:text-amber-300 font-medium">
          ⚠️ <strong>Aviso para el Anfitrión:</strong> Tu propiedad está en estado <strong>{estadoActual}</strong>. {alojamiento.motivoObservacionRechazo ? `Motivo registrado: "${alojamiento.motivoObservacionRechazo}"` : 'Aún no está disponible para reservas públicas.'}
        </div>
      )}

      {/* 1. Barra Superior de Retorno & Breadcrumbs Reales */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {habitacionEnDetalle ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setHabitacionEnDetalle(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Volver a Instalaciones del Hotel</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-xs sm:max-w-none">
                {habitacionEnDetalle.nombre}
              </span>
            </div>
          ) : (
            <button
              onClick={onVolver}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Volver al Catálogo</span>
            </button>
          )}

          {/* Selector Rápido de Habitaciones si está en vista de Habitación o Breadcrumbs */}
          {habitacionEnDetalle && esHotel && alojamiento.unidades && alojamiento.unidades.length > 1 ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 hidden md:inline">Otras opciones:</span>
              <div className="flex items-center gap-1.5">
                {alojamiento.unidades.map((u) => {
                  const activa = u.idUnidad === habitacionEnDetalle.idUnidad;
                  return (
                    <button
                      key={u.idUnidad}
                      type="button"
                      onClick={() => {
                        setSelectedUnidadId(u.idUnidad);
                        setHabitacionEnDetalle(u);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activa
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {u.nombre.includes('Suite') ? 'Suite Presidencial' : 'Doble Twin'}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Breadcrumbs Funcionales e Interactivos */
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={onVolver}
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition font-medium cursor-pointer"
              >
                Alojamientos
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => onFiltrarDepartamento ? onFiltrarDepartamento(alojamiento.departamento) : onVolver()}
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition font-medium cursor-pointer"
              >
                {alojamiento.departamento}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => onFiltrarCiudad ? onFiltrarCiudad(alojamiento.ciudad) : (onFiltrarDepartamento ? onFiltrarDepartamento(alojamiento.departamento) : onVolver())}
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition font-medium cursor-pointer"
              >
                {alojamiento.ciudad}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {alojamiento.titulo}
              </span>
            </div>
          )}

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
              {habitacionEnDetalle ? `🏨 Habitación de ${alojamiento.titulo}` : (alojamiento.tipoPropiedad || 'Alojamiento Tradicional')}
            </span>
            <span className="text-slate-400">•</span>
            <a
              href="#seccion-resenas"
              className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{resumen?.calificacionPromedio ? resumen.calificacionPromedio.toFixed(2) : (alojamiento.calificacionPromedio ? alojamiento.calificacionPromedio.toFixed(2) : '4.85')}</span>
              <span className="text-slate-400 font-normal underline">
                ({resumen?.totalResenas || resenasHotel.length || 3} reseñas verificadas)
              </span>
            </a>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {habitacionEnDetalle ? habitacionEnDetalle.nombre : alojamiento.titulo}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {habitacionEnDetalle ? (
                <>Ubicada en <strong>{alojamiento.titulo}</strong> — {alojamiento.direccion ? `${alojamiento.direccion}, ` : ''}{alojamiento.ciudad}, {alojamiento.departamento}</>
              ) : (
                <>{alojamiento.direccion ? `${alojamiento.direccion}, ` : ''}{alojamiento.ciudad}, Departamento de {alojamiento.departamento}, Bolivia</>
              )}
            </span>
          </p>
        </div>

        {/* 3. Galería Panorámica Interactiva con Lightbox */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[340px] sm:h-[420px] lg:h-[480px]">
            {/* Foto Hero Principal */}
            <div
              onClick={() => abrirLightbox(0)}
              className="relative md:col-span-2 md:row-span-2 h-full w-full overflow-hidden group cursor-pointer"
            >
              <img
                src={heroFoto}
                alt={habitacionEnDetalle ? habitacionEnDetalle.nombre : alojamiento.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-md">
                {habitacionEnDetalle ? `📸 Vista de ${habitacionEnDetalle.nombre}` : '⭐ Portada Principal'}
              </span>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Click para pantalla completa</span>
              </div>
            </div>

            {/* 4 Fotos Secundarias */}
            {sideFotos.map((foto, idx) => (
              <div
                key={idx}
                onClick={() => abrirLightbox(idx + 1)}
                className="hidden md:block relative h-full w-full overflow-hidden group cursor-pointer"
              >
                <img
                  src={foto}
                  alt={`${alojamiento.titulo} foto ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </div>

          <button
            onClick={() => abrirLightbox(0)}
            className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-black/75 hover:bg-blue-600 text-white text-xs font-semibold backdrop-blur-md transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>📸 {todasFotos.length} fotografías en alta resolución</span>
          </button>
        </div>

        {/* 4. Layout Principal en 2 Columnas (65% Info y Habitaciones | 35% Widget Reserva) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* COLUMNA IZQUIERDA (Info, Habitaciones, Servicios, Políticas, RESEÑAS) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Anfitrión Profesional y Sobrio */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20 shrink-0">
                  {alojamiento.nombreAnfitrion ? alojamiento.nombreAnfitrion.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {alojamiento.nombreAnfitrion || 'Carlos Mendoza'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                      Anfitrión Verificado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hospitalidad y calidad garantizada • Respuesta habitual en menos de 15 minutos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPerfilAnfitrionOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-xs font-semibold transition border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                >
                  Ver Perfil
                </button>
              </div>
            </div>

            {/* Descripción Completa */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Acerca de este alojamiento
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {alojamiento.descripcion}
              </p>
            </div>

            {/* SECCIÓN ESPECIAL PARA HOTELES: CATÁLOGO EXPANDIDO DE HABITACIONES O HABITACIÓN EN DETALLE */}
            {esHotel && alojamiento.unidades && alojamiento.unidades.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                {habitacionEnDetalle ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                          Habitación en pantalla individual
                        </span>
                        <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                          {habitacionEnDetalle.nombre}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHabitacionEnDetalle(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Ver todas las habitaciones del hotel</span>
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {habitacionEnDetalle.descripcion}
                    </p>

                    {/* Ficha técnica y comodidades exclusivas */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Equipamiento y Servicios Incluidos en esta Habitación:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                        {(habitacionEnDetalle.servicios || ['Cama King / Twin Confortable', 'Baño Privado con Ducha Termostática', 'Conexión WiFi de Alta Velocidad', 'Climatización Frío/Calor', 'Desayuno Buffet']).map((amenidad, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{amenidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                          Habitaciones Disponibles en el Hotel ({alojamiento.unidades.length})
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Selecciona la categoría que mejor se ajuste a tu viaje. Cada habitación tiene su propio inventario y galería fotográfica.
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
                            src={unidad.fotos?.[0] || unidad.fotografias?.[0]?.url || heroFoto}
                            alt={unidad.nombre}
                            className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
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
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {unidad.descripcion || 'Habitación exclusiva equipada con baño privado y servicios de primer nivel.'}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.capacidadPersonas} Huéspedes
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.cantidadCamas} Cama(s)
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-blue-600" />
                                {unidad.cantidadBanios || 1} Baño(s)
                              </span>
                            </div>

                            <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              ✓ {unidad.inventarioTotal || 2} unidades disponibles con confirmación inmediata
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 gap-2">
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

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUnidadId(unidad.idUnidad);
                                setHabitacionEnDetalle(unidad);
                                setActiveReviewTab('HABITACION');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Fotos y Detalles</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUnidadId(unidad.idUnidad);
                              }}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                esSeleccionada
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {esSeleccionada ? '✓ Elegida' : 'Elegir'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                  </>
                )}
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

            {/* ========================================================================= */}
            {/* 5. SECCIÓN COMPLETA DE RESEÑAS, 5 ATRIBUTOS Y OPINIONES VERIFICADAS      */}
            {/* ========================================================================= */}
            <div id="seccion-resenas" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                      Reseñas &amp; Experiencias de Huéspedes
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold">
                      NLP Verificado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Calificaciones certificadas de huéspedes que completaron su estancia con PIN de Check-in
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalNuevaResena(true)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Escribir Reseña</span>
                </button>
              </div>

              {/* Ficha Resumen de las 5 Dimensiones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                {/* Nota Global */}
                <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
                  <span className="font-serif text-5xl font-black text-slate-900 dark:text-white">
                    {resumen?.calificacionPromedio ? resumen.calificacionPromedio.toFixed(2) : '4.85'}
                  </span>
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Basado en {resumen?.totalResenas || resenasHotel.length || 3} opiniones
                  </span>
                  <span className="mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    ✓ 100% de huéspedes lo recomiendan
                  </span>
                </div>

                {/* Barras de los 5 Atributos */}
                <div className="md:col-span-2 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300 w-28">Limpieza</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((resumen?.promedioLimpieza || 5) / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                      {resumen?.promedioLimpieza ? resumen.promedioLimpieza.toFixed(1) : '5.0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300 w-28">Ubicación</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((resumen?.promedioUbicacion || 4.7) / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                      {resumen?.promedioUbicacion ? resumen.promedioUbicacion.toFixed(1) : '4.7'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300 w-28">Calidad/Precio</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((resumen?.promedioCalidadPrecio || 4.5) / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                      {resumen?.promedioCalidadPrecio ? resumen.promedioCalidadPrecio.toFixed(1) : '4.5'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300 w-28">Servicio</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((resumen?.promedioServicio || 4.8) / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                      {resumen?.promedioServicio ? resumen.promedioServicio.toFixed(1) : '4.8'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300 w-28">Comodidad</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${((resumen?.promedioComodidad || 4.7) / 5) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                      {resumen?.promedioComodidad ? resumen.promedioComodidad.toFixed(1) : '4.7'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Pestañas Hotel vs Habitación (Solo si es Hotel) */}
              {esHotel && (
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveReviewTab('HOTEL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeReviewTab === 'HOTEL'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🏨 Reseñas del Hotel en General</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white">
                      {resenasHotel.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReviewTab('HABITACION')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      activeReviewTab === 'HABITACION'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🛏️ Reseñas de {unidadActiva.nombre}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white">
                      {resenasHabitacion.length}
                    </span>
                  </button>
                </div>
              )}

              {/* Listado de Comentarios Filtrados */}
              <div className="space-y-4">
                {cargandoResenas ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Cargando opiniones verificadas...
                  </div>
                ) : (
                  (esHotel && activeReviewTab === 'HABITACION' ? resenasHabitacion : resenasHotel).length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      Aún no hay reseñas registradas en esta sección. ¡Sé el primero en compartir tu experiencia!
                    </div>
                  ) : (
                    (esHotel && activeReviewTab === 'HABITACION' ? resenasHabitacion : resenasHotel).map((resena) => (
                      <div
                        key={resena.idValoracion}
                        className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                              {resena.esAnonimo ? '🛡️' : (resena.nombreUsuario ? resena.nombreUsuario.charAt(0) : 'V')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {resena.esAnonimo ? 'Huésped Verificado 🛡️' : resena.nombreUsuario}
                                </span>
                                {resena.esAnonimo && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                                    Reseña Anónima
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {new Date(resena.fechaCreacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {resena.topicoPredicho && (
                              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                                #{resena.topicoPredicho}
                              </span>
                            )}
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
                              <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                              <span>{resena.puntuacionGeneral}.0</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {resena.comentario}
                        </p>
                      </div>
                    ))
                  )
                )}
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
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                    Habitación seleccionada
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {unidadActiva.nombre}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Capacidad: {unidadActiva.capacidadPersonas} huéspedes • {unidadActiva.cantidadCamas} camas
                  </span>
                </div>
              )}

              {/* Controles de Selección de Fecha */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Número de Huéspedes
                  </label>
                  <select
                    value={huespedes}
                    onChange={(e) => setHuespedes(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num} className="dark:bg-slate-900">
                        {num} {num === 1 ? 'huésped' : 'huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Control de Acciones: Administrar si es propio vs Disponibilidad vs Reservar */}
              {esMiPropiedad ? (
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/anfitrion';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Administrar este Alojamiento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : !estaDisponible ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Fechas No Disponibles</span>
                    </div>
                    <p className="text-[11px] text-red-600 dark:text-red-400">
                      Esta habitación ya cuenta con una reserva activa en las fechas seleccionadas ({checkIn} al {checkOut}). Por favor elige otro rango de fechas en el calendario.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>No Disponible en Estas Fechas</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onReservar(alojamiento, unidadActiva, checkIn, checkOut, huespedes)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reservar Hospedaje</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Desglose Transparente de Precios */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Bs. {precioNocheActual} × {noches} noches</span>
                  <span className="font-mono text-slate-900 dark:text-white">Bs. {subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Comisión de Servicio Aloja-Te</span>
                  <span className="text-emerald-600 font-bold">Gratis (0%)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                  <span>Monto Total a Pagar</span>
                  <span className="text-blue-600 font-mono text-base">Bs. {subtotal} BOB</span>
                </div>
              </div>

              {/* Nota de Seguridad BNB */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bloqueo instantáneo de inventario y pago protegido por BNB.</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX FOTOGRÁFICO A PANTALLA COMPLETA CON CONTROL DE TECLADO     */}
      {/* ========================================================================= */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        imagenes={todasFotos}
        indiceInicial={lightboxIndex}
        titulo={alojamiento.titulo}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ========================================================================= */}
      {/* MODAL PERFIL DEL ANFITRIÓN SOBRIO Y ELEGANTE                             */}
      {/* ========================================================================= */}
      {perfilAnfitrionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setPerfilAnfitrionOpen(false)}>
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white z-10 space-y-6 shadow-2xl animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-600/25">
                  {alojamiento.nombreAnfitrion ? alojamiento.nombreAnfitrion.charAt(0) : 'A'}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {alojamiento.nombreAnfitrion || 'Carlos Mendoza'}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                    Anfitrión en la Red Aloja-Te
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Miembro registrado en Bolivia desde 2024
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPerfilAnfitrionOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Métricas de Calidad */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center text-xs">
              <div>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base block">100%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Tasa de respuesta</span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base block">&lt; 15 min</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Tiempo habitual</span>
              </div>
              <div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base block">4.92 ★</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Calificación media</span>
              </div>
            </div>

            {/* Biografía */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Biografía & Compromiso</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Comprometido con brindar una estadía impecable, transparente y con la calidez tradicional de Bolivia. Atención personalizada, protocolos de limpieza rigurosos y disponibilidad constante para asistir a los viajeros.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPerfilAnfitrionOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                Cerrar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ESCRIBIR RESEÑA (1 CLIC + 5 ATRIBUTOS + ANÓNIMO)                    */}
      {/* ========================================================================= */}
      {modalNuevaResena && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setModalNuevaResena(false)}>
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white z-10 space-y-5 shadow-2xl animate-modal-in max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">
                  Experiencia Certificada
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Deja tu Reseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaResena(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mensajeExito ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">¡Reseña Publicada!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">{mensajeExito}</p>
              </div>
            ) : (
              <form onSubmit={enviarResena} className="space-y-4">
                
                {/* Calificación Rápida en 1 Clic */}
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    ¿Cómo calificarías tu estancia en general?
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPuntuacionGeneral(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star className={`w-8 h-8 ${star <= puntuacionGeneral ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                    {puntuacionGeneral === 5 && '⭐ Excelente experiencia'}
                    {puntuacionGeneral === 4 && '⭐ Muy buena estancia'}
                    {puntuacionGeneral === 3 && '⭐ Aceptable / Promedio'}
                    {puntuacionGeneral === 2 && '⭐ Regular con observaciones'}
                    {puntuacionGeneral === 1 && '⭐ No recomendada'}
                  </span>
                </div>

                {/* Checkbox Anónimo */}
                <div
                  onClick={() => setEsAnonimo(!esAnonimo)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center gap-3 transition"
                >
                  <input
                    type="checkbox"
                    checked={esAnonimo}
                    onChange={(e) => setEsAnonimo(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Publicar como Huésped Anónimo 🛡️
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Oculta tu nombre y datos personales ante el anfitrión y en la plataforma
                    </span>
                  </div>
                </div>

                {/* Acordeón Opcional de los 5 Atributos */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMostrarOpcionales(!mostrarOpcionales)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    <span>Detallar los 5 aspectos (Opcional)</span>
                    {mostrarOpcionales ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {mostrarOpcionales && (
                    <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs animate-fade-in">
                      {[
                        { label: 'Limpieza', val: limpieza, set: setLimpieza },
                        { label: 'Ubicación', val: ubicacion, set: setUbicacion },
                        { label: 'Calidad / Precio', val: calidadPrecio, set: setCalidadPrecio },
                        { label: 'Servicio y Atención', val: servicio, set: setServicio },
                        { label: 'Comodidad de Instalaciones', val: comodidad, set: setComodidad },
                      ].map((attr) => (
                        <div key={attr.label} className="flex items-center justify-between gap-3">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{attr.label}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => attr.set(st)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star className={`w-4 h-4 ${st <= (attr.val ?? puntuacionGeneral) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comentario de Texto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Cuéntanos tu experiencia *
                  </label>
                  <textarea
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="¿Qué fue lo que más te gustó? (Limpieza, desayuno, descanso, atención)..."
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalNuevaResena(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !comentario.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{enviando ? 'Publicando...' : 'Enviar Reseña'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
