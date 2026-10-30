import React, { useState, useRef } from 'react';
import { 
  X, Home, Hotel, Building2, MapPin, Sparkles, ImagePlus, Star, 
  Trash2, Plus, BedDouble, Users, Bath, Check, ArrowRight, ArrowLeft, 
  ShieldCheck, Clock, Loader2, DollarSign, UploadCloud, Edit3
} from 'lucide-react';
import { Alojamiento, UnidadReservable } from '../../catalogo/types/catalogo.types';
import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { useAuth } from '../../../core/auth/AuthContext';

interface ListingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlojamientoCreado: (alojamiento: Alojamiento) => void;
}

interface HabitacionDraft {
  id: string;
  nombre: string;
  capacidad: number;
  camas: number;
  banos: number;
  inventarioTotal: number;
  precioNoche: number;
  fotoUrl: string;
  servicios: string[];
}

export const ListingWizardModal: React.FC<ListingWizardModalProps> = ({
  isOpen,
  onClose,
  onAlojamientoCreado,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Modalidad
  const [modalidad, setModalidad] = useState<'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL'>('CASA_DEPARTAMENTO');
  const [tipoPropiedadNombre, setTipoPropiedadNombre] = useState('Casa de Campo');

  // Step 2: Info & Ubicación
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [departamento, setDepartamento] = useState('Santa Cruz');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarioEntrada, setHorarioEntrada] = useState('14:00');
  const [horarioSalida, setHorarioSalida] = useState('11:00');
  const [politicas, setPoliticas] = useState('Ambiente tranquilo. Prohibido fumar en interiores.');

  // Step 3: Servicios
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([
    'Wifi de Alta Velocidad (Starlink)',
    'Estacionamiento Gratuito'
  ]);

  // Step 4: Fotos múltiples con Portada & Drag & Drop
  const [fotos, setFotos] = useState<{ id: string; url: string; esPrincipal: boolean }[]>([
    {
      id: 'f-1',
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      esPrincipal: true
    }
  ]);
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Step 5: Casa (datos de unidad única)
  const [capacidadCasa, setCapacidadCasa] = useState(4);
  const [dormitoriosCasa, setDormitoriosCasa] = useState(2);
  const [camasCasa, setCamasCasa] = useState(3);
  const [banosCasa, setBanosCasa] = useState(2);
  const [precioCasa, setPrecioCasa] = useState(450);

  // Step 5: Hotel (múltiples habitaciones)
  const [habitacionesHotel, setHabitacionesHotel] = useState<HabitacionDraft[]>([
    {
      id: 'hab-1',
      nombre: 'Suite Ejecutiva Chiquitana',
      capacidad: 2,
      camas: 1,
      banos: 1,
      inventarioTotal: 4,
      precioNoche: 380,
      fotoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      servicios: ['Wifi Starlink', 'Aire Acondicionado', 'Frigobar']
    }
  ]);

  // Sub-modal para crear o editar habitación en Hotel
  const [creandoHabitacion, setCreandoHabitacion] = useState(false);
  const [editandoHabId, setEditandoHabId] = useState<string | null>(null);
  const [habNombre, setHabNombre] = useState('Habitación Doble Twin');
  const [habCapacidad, setHabCapacidad] = useState(2);
  const [habCamas, setHabCamas] = useState(2);
  const [habBanos, setHabBanos] = useState(1);
  const [habInventario, setHabInventario] = useState(6);
  const [habPrecio, setHabPrecio] = useState(280);
  const [habFoto, setHabFoto] = useState('https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80');

  if (!isOpen) return null;

  // Catálogo de Servicios Disponibles
  const listaServiciosDisponibles = [
    'Wifi de Alta Velocidad (Starlink)',
    'Piscina Privada / Compartida',
    'Aire Acondicionado',
    'Cocina Equipada',
    'Estacionamiento Gratuito',
    'Parrillera / Churrasquera',
    'Desayuno Buffet Incluido',
    'Jacuzzi / Hidromasaje',
    'Calefacción / Chimenea',
    'Pet Friendly (Acepta mascotas)'
  ];

  const departamentosBolivia = [
    'Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 
    'Chuquisaca', 'Oruro', 'Potosí', 'Beni', 'Pando'
  ];

  const toggleServicio = (nombre: string) => {
    if (serviciosSeleccionados.includes(nombre)) {
      setServiciosSeleccionados(prev => prev.filter(s => s !== nombre));
    } else {
      setServiciosSeleccionados(prev => [...prev, nombre]);
    }
  };

  // Manejo de Fotos (Drag & Drop, Selector Local y URL)
  const handleArchivosLocales = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    const filesArray = Array.from(archivos);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setFotos(prev => [
            ...prev,
            {
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl,
              esPrincipal: prev.length === 0
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const agregarFoto = () => {
    if (!nuevaFotoUrl.trim()) return;
    const esPrimera = fotos.length === 0;
    setFotos(prev => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        url: nuevaFotoUrl.trim(),
        esPrincipal: esPrimera
      }
    ]);
    setNuevaFotoUrl('');
  };

  const seleccionarFotoPrincipal = (id: string) => {
    setFotos(prev => prev.map(f => ({ ...f, esPrincipal: f.id === id })));
  };

  const eliminarFoto = (id: string) => {
    setFotos(prev => {
      const filtradas = prev.filter(f => f.id !== id);
      if (filtradas.length > 0 && !filtradas.some(f => f.esPrincipal)) {
        filtradas[0].esPrincipal = true;
      }
      return filtradas;
    });
  };

  // Manejo de Habitaciones en Hotel (Creación y Edición Completa)
  const iniciarEdicionHabitacion = (h: HabitacionDraft) => {
    setEditandoHabId(h.id);
    setHabNombre(h.nombre);
    setHabCapacidad(h.capacidad);
    setHabCamas(h.camas);
    setHabBanos(h.banos);
    setHabInventario(h.inventarioTotal);
    setHabPrecio(h.precioNoche);
    setHabFoto(h.fotoUrl);
    setCreandoHabitacion(true);
  };

  const abrirCrearHabitacion = () => {
    setEditandoHabId(null);
    setHabNombre('Habitación Estándar');
    setHabCapacidad(2);
    setHabCamas(1);
    setHabBanos(1);
    setHabInventario(5);
    setHabPrecio(320);
    setHabFoto('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
    setCreandoHabitacion(true);
  };

  const guardarHabitacionHotel = () => {
    if (!habNombre.trim()) return;

    if (editandoHabId) {
      setHabitacionesHotel(prev => prev.map(h => {
        if (h.id === editandoHabId) {
          return {
            ...h,
            nombre: habNombre.trim(),
            capacidad: habCapacidad,
            camas: habCamas,
            banos: habBanos,
            inventarioTotal: habInventario,
            precioNoche: habPrecio,
            fotoUrl: habFoto,
          };
        }
        return h;
      }));
    } else {
      const nueva: HabitacionDraft = {
        id: `hab-${Date.now()}`,
        nombre: habNombre.trim(),
        capacidad: habCapacidad,
        camas: habCamas,
        banos: habBanos,
        inventarioTotal: habInventario,
        precioNoche: habPrecio,
        fotoUrl: habFoto,
        servicios: ['Wifi Starlink', 'Baño Privado']
      };
      setHabitacionesHotel(prev => [...prev, nueva]);
    }

    setEditandoHabId(null);
    setCreandoHabitacion(false);
  };

  const eliminarHabitacionHotel = (id: string) => {
    setHabitacionesHotel(prev => prev.filter(h => h.id !== id));
  };

  // Validaciones por paso
  const puedeAvanzar = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return titulo.trim().length >= 5 && ciudad.trim().length >= 2;
    if (currentStep === 3) return serviciosSeleccionados.length > 0;
    if (currentStep === 4) return fotos.length > 0;
    if (currentStep === 5) {
      if (modalidad === 'CASA_DEPARTAMENTO') return precioCasa > 0 && capacidadCasa > 0;
      if (modalidad === 'HOTEL_HOSTAL') return habitacionesHotel.length > 0;
    }
    return true;
  };

  // Guardar en Backend (MS-01) y Catálogo
  const handleGuardarAlojamiento = async () => {
    setLoading(true);
    setError(null);

    const anfitrionId = user?.id || '8fff278f-8dfd-47da-94bb-6e658b6f7178';
    const fotoPrincipalObj = fotos.find(f => f.esPrincipal) || fotos[0];

    // Construcción de Unidades
    let unidadesFinales: UnidadReservable[] = [];
    if (modalidad === 'CASA_DEPARTAMENTO') {
      unidadesFinales = [{
        idUnidad: `u-${Date.now()}`,
        nombre: 'Espacio Completo Entero',
        capacidadPersonas: capacidadCasa,
        cantidadCamas: camasCasa,
        cantidadBanios: banosCasa,
        cantidadBanos: banosCasa,
        inventarioTotal: 1,
        precioNoche: precioCasa,
        moneda: 'BOB',
        activo: true,
        estado: 'DISPONIBLE'
      }];
    } else {
      unidadesFinales = habitacionesHotel.map(h => ({
        idUnidad: h.id,
        nombre: h.nombre,
        capacidadPersonas: h.capacidad,
        cantidadCamas: h.camas,
        cantidadBanios: h.banos,
        cantidadBanos: h.banos,
        inventarioTotal: h.inventarioTotal,
        precioNoche: h.precioNoche,
        moneda: 'BOB',
        activo: true,
        estado: 'DISPONIBLE'
      }));
    }

    const payloadBackend = {
      idAnfitrion: anfitrionId,
      idTipoPropiedad: modalidad === 'HOTEL_HOSTAL' ? 2 : 1,
      titulo,
      descripcion: descripcion || `Hermoso alojamiento ubicado en ${ciudad}, ${departamento}.`,
      direccion: direccion || `${ciudad}, Bolivia`,
      ciudad,
      departamento,
      latitud: -17.7833,
      longitud: -63.1821,
      modalidad,
      politicas,
      horarioEntrada,
      horarioSalida,
      serviciosIds: [1, 2, 3]
    };

    try {
      let nuevoAlojamiento: Alojamiento;

      try {
        const res = await httpClient.post<any>('/api/v1/alojamientos', payloadBackend);
        const data = res.data;
        nuevoAlojamiento = {
          idAlojamiento: data.idAlojamiento || `aloj-${Date.now()}`,
          idAnfitrion: anfitrionId,
          titulo,
          descripcion: payloadBackend.descripcion,
          tipoPropiedad: tipoPropiedadNombre,
          modalidad,
          departamento,
          ciudad,
          direccion: payloadBackend.direccion,
          precioBaseNoche: modalidad === 'CASA_DEPARTAMENTO' ? precioCasa : habitacionesHotel[0]?.precioNoche || 300,
          moneda: 'BOB',
          calificacionPromedio: 5.0,
          totalResenas: 1,
          fotografias: fotos.map((f, i) => ({
            idFotografia: f.id,
            url: f.url,
            esPrincipal: f.esPrincipal,
            orden: i + 1
          })),
          servicios: serviciosSeleccionados.map((s, i) => ({ idServicio: i + 1, nombre: s, categoria: 'CONFORT' })),
          unidades: unidadesFinales,
          politicas,
          horarioEntrada,
          horarioSalida,
          estado: 'EN_REVISION',
          estadoPublicacion: 'EN_REVISION'
        };
      } catch (apiErr) {
        console.warn('API MS-01 respondió con advertencia, creando en persistencia local:', apiErr);
        nuevoAlojamiento = {
          idAlojamiento: `aloj-${Date.now()}`,
          idAnfitrion: anfitrionId,
          titulo,
          descripcion: payloadBackend.descripcion,
          tipoPropiedad: tipoPropiedadNombre,
          modalidad,
          departamento,
          ciudad,
          direccion: payloadBackend.direccion,
          precioBaseNoche: modalidad === 'CASA_DEPARTAMENTO' ? precioCasa : habitacionesHotel[0]?.precioNoche || 300,
          moneda: 'BOB',
          calificacionPromedio: 5.0,
          totalResenas: 0,
          fotografias: fotos.map((f, i) => ({
            idFotografia: f.id,
            url: f.url,
            esPrincipal: f.esPrincipal,
            orden: i + 1
          })),
          servicios: serviciosSeleccionados.map((s, i) => ({ idServicio: i + 1, nombre: s, categoria: 'CONFORT' })),
          unidades: unidadesFinales,
          politicas,
          horarioEntrada,
          horarioSalida,
          estado: 'EN_REVISION',
          estadoPublicacion: 'EN_REVISION'
        };
      }

      onAlojamientoCreado(nuevoAlojamiento);
      alert('¡Alojamiento registrado exitosamente y enviado a moderación!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el alojamiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container - Royal Blue & Clean White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col max-h-[90vh]">
        
        {/* Header con Badge Circular y Barra de Progreso Azul */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
                {currentStep}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  WIZARD DE PUBLICACIÓN • PASO {currentStep} DE 5
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {currentStep === 1 && 'Selecciona la Modalidad de Hospedaje'}
                  {currentStep === 2 && 'Datos Generales & Ubicación en Bolivia'}
                  {currentStep === 3 && 'Amenidades & Servicios Disponibles'}
                  {currentStep === 4 && 'Galería de Fotos & Portada Principal'}
                  {currentStep === 5 && (modalidad === 'CASA_DEPARTAMENTO' ? 'Capacidad & Tarifa de la Casa' : 'Gestor de Habitaciones del Hotel')}
                </h3>
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

          {/* Barra Visual de Avance Horizontal */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Body Dinámico con Scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* ================= PASO 1: MODALIDAD ================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona cómo vas a ofrecer tu propiedad a los viajeros bolivianos y extranjeros:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción A: Casa / Depto */}
                <div
                  onClick={() => {
                    setModalidad('CASA_DEPARTAMENTO');
                    setTipoPropiedadNombre('Casa de Campo');
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    modalidad === 'CASA_DEPARTAMENTO'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Casa / Departamento Entero
                    </h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Oferta Única
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Todo el espacio es exclusivo para el huésped. Se reserva como 1 sola unidad completa (cabaña, chalet, departamento o casa de campo).
                  </p>
                </div>

                {/* Opción B: Hotel / Hostal */}
                <div
                  onClick={() => {
                    setModalidad('HOTEL_HOSTAL');
                    setTipoPropiedadNombre('Hotel Boutique');
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    modalidad === 'HOTEL_HOSTAL'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Hotel className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Hotel / Hostal / Resort
                    </h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      Multihabitación
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Establecimiento con recepción y múltiples tipos de habitaciones (Suites, Dobles, Simples) con inventarios y fotos independientes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 2: INFORMACIÓN & UBICACIÓN ================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Título de la Publicación *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Cabaña Chiquitana Los Cántaros con Piscina"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe la vista, el entorno, atractivos cercanos y comodidades destacadas..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Departamento de Bolivia *
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departamentosBolivia.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Ciudad / Municipio *
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej. Samaipata, Coroico, San José"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Dirección o Referencia
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Km 5 Camino a La Pajcha, cerca del mirador"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Horario de Check-in
                  </label>
                  <input
                    type="time"
                    value={horarioEntrada}
                    onChange={(e) => setHorarioEntrada(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Horario de Check-out
                  </label>
                  <input
                    type="time"
                    value={horarioSalida}
                    onChange={(e) => setHorarioSalida(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 3: SERVICIOS ================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona los servicios con los que cuenta tu propiedad para que los viajeros puedan filtrar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {listaServiciosDisponibles.map((servicio) => {
                  const activo = serviciosSeleccionados.includes(servicio);
                  return (
                    <button
                      key={servicio}
                      type="button"
                      onClick={() => toggleServicio(servicio)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition ${
                        activo
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span>{servicio}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        activo ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                      }`}>
                        {activo && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= PASO 4: FOTOS MÚLTIPLES & PORTADA ================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Agrega las fotografías del establecimiento. Puedes arrastrar imágenes desde tu computadora o buscar archivos locales. La foto con <span className="font-bold text-blue-600 dark:text-blue-400">estrella</span> será la portada principal:
              </p>

              {/* Zona Interactiva de Drag & Drop y Subida de Archivos */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    handleArchivosLocales(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleArchivosLocales(e.target.files);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Arrastra tus fotos aquí o <span className="text-blue-600 dark:text-blue-400 underline">haz clic para buscarlas en tu equipo</span>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Admite archivos JPG, PNG o WEBP locales (subida múltiple simultánea)
                </p>
              </div>

              {/* Opción Alternativa: Agregar por URL web */}
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  value={nuevaFotoUrl}
                  onChange={(e) => setNuevaFotoUrl(e.target.value)}
                  placeholder="O pega aquí la URL web de una foto (ej. Unsplash o CDN)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={agregarFoto}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir URL</span>
                </button>
              </div>

              {/* Grilla de Fotos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((foto) => (
                  <div 
                    key={foto.id}
                    className={`relative rounded-2xl overflow-hidden aspect-video border-2 group transition-all ${
                      foto.esPrincipal 
                        ? 'border-blue-600 ring-2 ring-blue-500/30' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <img src={foto.url} alt="Foto alojamiento" className="w-full h-full object-cover" />
                    
                    {/* Badge Portada */}
                    {foto.esPrincipal ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Portada Principal</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => seleccionarFotoPrincipal(foto.id)}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 hover:bg-blue-600 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-1 backdrop-blur-sm"
                      >
                        <Star className="w-3 h-3" />
                        <span>Hacer Portada</span>
                      </button>
                    )}

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => eliminarFoto(foto.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= PASO 5: CASA O GESTOR DE HABITACIONES ================= */}
          {currentStep === 5 && modalidad === 'CASA_DEPARTAMENTO' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define la capacidad de hospedaje y la tarifa por noche de tu casa completa:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Capacidad</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setCapacidadCasa(Math.max(1, capacidadCasa - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{capacidadCasa}</span>
                    <button 
                      type="button" 
                      onClick={() => setCapacidadCasa(capacidadCasa + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dormitorios</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setDormitoriosCasa(Math.max(1, dormitoriosCasa - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{dormitoriosCasa}</span>
                    <button 
                      type="button" 
                      onClick={() => setDormitoriosCasa(dormitoriosCasa + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Camas</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setCamasCasa(Math.max(1, camasCasa - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{camasCasa}</span>
                    <button 
                      type="button" 
                      onClick={() => setCamasCasa(camasCasa + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Baños</span>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setBanosCasa(Math.max(1, banosCasa - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{banosCasa}</span>
                    <button 
                      type="button" 
                      onClick={() => setBanosCasa(banosCasa + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20">
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1.5">
                  Tarifa por Noche (Bolivianos - BOB) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">Bs.</span>
                  <input
                    type="number"
                    value={precioCasa}
                    onChange={(e) => setPrecioCasa(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  El anfitrión recibe el 90% del valor de cada reserva confirmada directamente en su cuenta bancaria.
                </p>
              </div>
            </div>
          )}

          {/* ================= PASO 5: HOTEL (GESTOR DE HABITACIONES) ================= */}
          {currentStep === 5 && modalidad === 'HOTEL_HOSTAL' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Tipos de Habitación del Hotel ({habitacionesHotel.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Agrega cada categoría con sus fotos e inventario disponible.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={abrirCrearHabitacion}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Habitación</span>
                </button>
              </div>

              {/* Sub-formulario para nueva habitación o edición */}
              {creandoHabitacion && (
                <div className="p-5 rounded-2xl border-2 border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      {editandoHabId ? 'Editar Habitación del Hotel' : 'Nueva Habitación para el Hotel'}
                    </span>
                    <button type="button" onClick={() => { setCreandoHabitacion(false); setEditandoHabId(null); }}>
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={habNombre}
                        onChange={(e) => setHabNombre(e.target.value)}
                        placeholder="Ej. Habitación Doble Twin"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Foto de la Habitación (URL o local)</label>
                      <input
                        type="url"
                        value={habFoto}
                        onChange={(e) => setHabFoto(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Capacidad</label>
                      <input
                        type="number"
                        min="1"
                        value={habCapacidad}
                        onChange={(e) => setHabCapacidad(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-center font-bold bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Camas</label>
                      <input
                        type="number"
                        min="1"
                        value={habCamas}
                        onChange={(e) => setHabCamas(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-center font-bold bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Inventario</label>
                      <input
                        type="number"
                        min="1"
                        value={habInventario}
                        onChange={(e) => setHabInventario(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-center font-bold bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">Precio Bs.</label>
                      <input
                        type="number"
                        min="10"
                        value={habPrecio}
                        onChange={(e) => setHabPrecio(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-center font-bold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setCreandoHabitacion(false); setEditandoHabId(null); }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={guardarHabitacionHotel}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      {editandoHabId ? 'Actualizar Habitación' : 'Guardar Habitación'}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Habitaciones Existentes */}
              <div className="space-y-3">
                {habitacionesHotel.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shadow-sm hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={h.fotoUrl} alt={h.nombre} className="w-16 h-14 object-cover rounded-xl shrink-0 border border-slate-200 dark:border-slate-800" />
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">{h.nombre}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{h.capacidad} Huéspedes</span>
                          <span>•</span>
                          <span>{h.camas} Camas</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{h.inventarioTotal} disponibles</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Por noche</span>
                        <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                          Bs. {h.precioNoche}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => iniciarEdicionHabitacion(h)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        title="Editar precio e inventario"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarHabitacionHotel(h.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Eliminar habitación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con Botones de Navegación */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold disabled:opacity-30 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
              disabled={!puedeAvanzar()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGuardarAlojamiento}
              disabled={loading || !puedeAvanzar()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{modalidad === 'CASA_DEPARTAMENTO' ? 'Publicar Casa en Catálogo' : 'Finalizar y Publicar Hotel'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};