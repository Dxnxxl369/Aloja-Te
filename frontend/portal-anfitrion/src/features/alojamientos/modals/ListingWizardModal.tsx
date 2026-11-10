import React, { useState, useRef } from 'react';
import {
  X, Home, Hotel, Building2, MapPin, Sparkles, ImagePlus, Star,
  Trash2, Plus, BedDouble, Users, Bath, Check, ArrowRight, ArrowLeft,
  ShieldCheck, Clock, Loader2, DollarSign, UploadCloud, Edit3, DoorOpen
} from 'lucide-react';
import { Alojamiento, UnidadReservable, Fotografia } from '../../../core/types/anfitrion.types';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';
import { alojamientoService } from '../services/alojamientoService';

interface ListingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlojamientoCreado: (alojamiento: Alojamiento) => void;
}

interface FotoItem {
  id: string;
  url: string;
  esPrincipal: boolean;
}

interface HabitacionDraft {
  id: string;
  nombre: string;
  capacidad: number;
  camas: number;
  banos: number;
  inventarioTotal: number;
  precioNoche: number;
  fotos: FotoItem[];
  servicios: string[];
}

export const ListingWizardModal: React.FC<ListingWizardModalProps> = ({
  isOpen,
  onClose,
  onAlojamientoCreado,
}) => {
  const { perfil, anfitrionClave } = useAnfitrionAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const habFileInputRef = useRef<HTMLInputElement | null>(null);

  // Pasos del Wizard (1 al 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Modalidad
  const [modalidad, setModalidad] = useState<'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL'>('CASA_DEPARTAMENTO');
  const [tipoPropiedadNombre, setTipoPropiedadNombre] = useState('Casa de Campo');

  // Paso 2: Info & Ubicación en Bolivia
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [departamento, setDepartamento] = useState(perfil.ciudad.includes('Tarija') ? 'Tarija' : 'Santa Cruz');
  const [ciudad, setCiudad] = useState(perfil.ciudad.split(' ')[0] || 'Santa Cruz de la Sierra');
  const [direccion, setDireccion] = useState('');
  const [horarioEntrada, setHorarioEntrada] = useState('14:00');
  const [horarioSalida, setHorarioSalida] = useState('11:00');
  const [politicas, setPoliticas] = useState('Ambiente tranquilo. Prohibido fumar en interiores.');

  // Paso 3: Servicios & Confort
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([
    'Wifi de Alta Velocidad (Starlink)',
    'Estacionamiento Gratuito'
  ]);

  // Paso 4: Fotos múltiples con selección de Portada
  const [fotos, setFotos] = useState<{ id: string; url: string; esPrincipal: boolean }[]>([
    {
      id: 'f-1',
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      esPrincipal: true
    }
  ]);
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');

  // Paso 5: Casa / Cabaña (unidad única)
  const [capacidadCasa, setCapacidadCasa] = useState(4);
  const [dormitoriosCasa, setDormitoriosCasa] = useState(2);
  const [camasCasa, setCamasCasa] = useState(3);
  const [banosCasa, setBanosCasa] = useState(2);
  const [precioCasa, setPrecioCasa] = useState(450);

  // Paso 5: Hotel (múltiples habitaciones independientes)
  const [habitacionesHotel, setHabitacionesHotel] = useState<HabitacionDraft[]>([
    {
      id: 'hab-1',
      nombre: 'Suite Ejecutiva Confort',
      capacidad: 2,
      camas: 1,
      banos: 1,
      inventarioTotal: 4,
      precioNoche: 380,
      fotos: [
        {
          id: 'f-hab-1',
          url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          esPrincipal: true
        }
      ],
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
  const [habFotos, setHabFotos] = useState<FotoItem[]>([
    {
      id: 'f-hab-default',
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      esPrincipal: true
    }
  ]);
  const [nuevaFotoHabUrl, setNuevaFotoHabUrl] = useState('');
  const [subiendoFotoHab, setSubiendoFotoHab] = useState(false);

  if (!isOpen) return null;

  // Lista de departamentos oficiales de Bolivia
  const DEPARTAMENTOS_BOLIVIA = [
    'Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Chuquisaca', 'Oruro', 'Potosí', 'Beni', 'Pando'
  ];

  // Catálogo de amenidades
  const SERVICIOS_DISPONIBLES = [
    'Wifi de Alta Velocidad (Starlink)',
    'Piscina Privada / Climatizada',
    'Desayuno Buffet Típico',
    'Aire Acondicionado Digital',
    'Calefacción Central',
    'Estacionamiento Gratuito',
    'Churrasquera / Parrillero',
    'Chimenea a Leña',
    'Cocina Completa Equipada',
    'Jacuzzi / Hidromasaje',
    'Seguridad Privada 24/7',
    'Vistas Panorámicas a las Sierras'
  ];

  const toggleServicio = (srv: string) => {
    setServiciosSeleccionados(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  // Gestión de fotos de la propiedad (Subida directa a la nube / Supabase / S3)
  const handleArchivosLocales = async (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    for (const file of Array.from(archivos)) {
      try {
        const formData = new FormData();
        formData.append('archivo', file);
        const res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=alojamientos`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setFotos(prev => [
              ...prev,
              {
                id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                url: data.url,
                esPrincipal: prev.length === 0
              }
            ]);
            continue;
          }
        }
      } catch (err) {
        console.warn('Error al subir foto de alojamiento a la nube, usando fallback local:', err);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setFotos(prev => [
            ...prev,
            {
              id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl,
              esPrincipal: prev.length === 0
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarFotoPorUrl = () => {
    if (!nuevaFotoUrl.trim()) return;
    setFotos(prev => [
      ...prev,
      {
        id: `foto-${Date.now()}`,
        url: nuevaFotoUrl.trim(),
        esPrincipal: prev.length === 0
      }
    ]);
    setNuevaFotoUrl('');
  };

  const marcarFotoPrincipal = (id: string) => {
    setFotos(prev => {
      const seleccionada = prev.find(f => f.id === id);
      if (!seleccionada) return prev;
      const restantes = prev.filter(f => f.id !== id);
      return [
        { ...seleccionada, esPrincipal: true },
        ...restantes.map(f => ({ ...f, esPrincipal: false }))
      ];
    });
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

  // Gestión de fotos de cada habitación del hotel
  const handleArchivosLocalesHabitacion = async (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    setSubiendoFotoHab(true);
    for (const file of Array.from(archivos)) {
      try {
        const formData = new FormData();
        formData.append('archivo', file);
        const res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=habitaciones`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setHabFotos(prev => [
              ...prev,
              {
                id: `fhab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                url: data.url,
                esPrincipal: prev.length === 0
              }
            ]);
            continue;
          }
        }
      } catch (err) {
        console.warn('Error al subir foto de habitación, usando fallback local:', err);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setHabFotos(prev => [
            ...prev,
            {
              id: `fhab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl,
              esPrincipal: prev.length === 0
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
    setSubiendoFotoHab(false);
  };

  const agregarFotoHabPorUrl = () => {
    if (!nuevaFotoHabUrl.trim()) return;
    setHabFotos(prev => [
      ...prev,
      {
        id: `fhab-${Date.now()}`,
        url: nuevaFotoHabUrl.trim(),
        esPrincipal: prev.length === 0
      }
    ]);
    setNuevaFotoHabUrl('');
  };

  const marcarFotoPrincipalHab = (id: string) => {
    setHabFotos(prev => {
      const seleccionada = prev.find(f => f.id === id);
      if (!seleccionada) return prev;
      const restantes = prev.filter(f => f.id !== id);
      return [
        { ...seleccionada, esPrincipal: true },
        ...restantes.map(f => ({ ...f, esPrincipal: false }))
      ];
    });
  };

  const eliminarFotoHab = (id: string) => {
    setHabFotos(prev => {
      const filtradas = prev.filter(f => f.id !== id);
      if (filtradas.length > 0 && !filtradas.some(f => f.esPrincipal)) {
        filtradas[0].esPrincipal = true;
      }
      return filtradas;
    });
  };

  // Guardar habitación en modo Hotel
  const guardarHabitacionHotel = () => {
    if (!habNombre.trim()) return;
    const aseguradas = [...habFotos];
    if (aseguradas.length > 0 && !aseguradas.some(f => f.esPrincipal)) {
      aseguradas[0].esPrincipal = true;
    }

    if (editandoHabId) {
      setHabitacionesHotel(prev => prev.map(h => {
        if (h.id === editandoHabId) {
          return {
            ...h,
            nombre: habNombre,
            capacidad: habCapacidad,
            camas: habCamas,
            banos: habBanos,
            inventarioTotal: habInventario,
            precioNoche: habPrecio,
            fotos: aseguradas
          };
        }
        return h;
      }));
    } else {
      const nueva: HabitacionDraft = {
        id: `hab-${Date.now()}`,
        nombre: habNombre,
        capacidad: habCapacidad,
        camas: habCamas,
        banos: habBanos,
        inventarioTotal: habInventario,
        precioNoche: habPrecio,
        fotos: aseguradas,
        servicios: ['Wifi Starlink', 'Baño Privado']
      };
      setHabitacionesHotel(prev => [...prev, nueva]);
    }

    setCreandoHabitacion(false);
    setEditandoHabId(null);
  };

  // Validaciones
  const puedeAvanzar = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return titulo.trim().length >= 4 && ciudad.trim().length >= 2;
    if (currentStep === 3) return serviciosSeleccionados.length > 0;
    if (currentStep === 4) return fotos.length > 0;
    if (currentStep === 5) {
      if (modalidad === 'CASA_DEPARTAMENTO') return precioCasa > 0 && capacidadCasa > 0;
      if (modalidad === 'HOTEL_HOSTAL') return habitacionesHotel.length > 0;
    }
    return true;
  };

  // Guardar y Publicar en Cola de Auditoría
  const handleGuardarAlojamiento = async () => {
    setLoading(true);
    setError(null);

    const fotoPrincipalObj = fotos.find(f => f.esPrincipal) || fotos[0];
    const fotosObj: Fotografia[] = fotos.map((f, i) => ({
      idFotografia: f.id,
      url: f.url,
      esPrincipal: f.esPrincipal,
      orden: i,
      descripcion: f.esPrincipal ? `Portada de ${titulo}` : `Vista de ${titulo}`
    }));

    let unidadesFinales: UnidadReservable[] = [];

    if (modalidad === 'CASA_DEPARTAMENTO') {
      unidadesFinales = [
        {
          idUnidad: `u-${Date.now()}`,
          nombre: 'Propiedad Completa',
          descripcion: descripcion || 'Espacio privado completo',
          capacidadPersonas: capacidadCasa,
          cantidadDormitorios: dormitoriosCasa,
          cantidadCamas: camasCasa,
          cantidadBanios: banosCasa,
          cantidadBanos: banosCasa,
          inventarioTotal: 1,
          precioNoche: precioCasa,
          moneda: 'BOB',
          activo: true,
          estado: 'PENDIENTE',
          estadoOperativo: 'LIBRE',
          fotos: fotos.map(f => f.url),
          fotografias: fotosObj,
          servicios: serviciosSeleccionados
        }
      ];
    } else {
      unidadesFinales = habitacionesHotel.map((h, idx) => ({
        idUnidad: h.id,
        nombre: h.nombre,
        descripcion: `Habitación ${h.nombre} con baño privado y servicios de confort.`,
        capacidadPersonas: h.capacidad,
        cantidadDormitorios: 1,
        cantidadCamas: h.camas,
        cantidadBanios: h.banos,
        cantidadBanos: h.banos,
        inventarioTotal: h.inventarioTotal,
        precioNoche: h.precioNoche,
        moneda: 'BOB',
        activo: true,
        estado: 'PENDIENTE',
        estadoOperativo: 'LIBRE',
        fotos: h.fotos.map(f => f.url),
        fotografias: h.fotos.map((f, i) => ({
          idFotografia: f.id || `f-${h.id}-${i}`,
          url: f.url,
          esPrincipal: f.esPrincipal,
          orden: i,
          descripcion: `Foto de ${h.nombre}`
        })),
        servicios: h.servicios
      }));
    }

    const isUuid = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let anfitrionUuid = isUuid(perfil.id) ? perfil.id : '';
    if (!anfitrionUuid) {
      if (perfil.email?.includes('daniel') || perfil.nombre?.includes('Daniel') || anfitrionClave.includes('daniel')) {
        anfitrionUuid = '7c772f61-90f1-474a-8acf-e7ba66e20d40';
      } else if (perfil.email?.includes('elena') || perfil.nombre?.includes('Elena')) {
        anfitrionUuid = 'a0000000-0000-4000-8000-000000000003';
      } else {
        anfitrionUuid = 'a0000000-0000-4000-8000-000000000002';
      }
    }

    const nuevoAlojamiento: Alojamiento = {
      idAlojamiento: `aloj-${Date.now()}`,
      idAnfitrion: anfitrionUuid,
      nombreAnfitrion: perfil.nombre,
      titulo,
      descripcion: descripcion || `Hermoso hospedaje ubicado en ${ciudad}, ${departamento}.`,
      departamento,
      ciudad,
      direccion: direccion || `${ciudad}, Bolivia`,
      tipoPropiedad: modalidad === 'HOTEL_HOSTAL' ? 'HOTEL' : (tipoPropiedadNombre || 'CABAÑA'),
      tipoEspacio: modalidad === 'HOTEL_HOSTAL' ? 'HABITACION_PRIVADA' : 'ALOJAMIENTO_ENTERO',
      modalidad,
      politicas,
      horarioEntrada,
      horarioSalida,
      precioBaseNoche: modalidad === 'CASA_DEPARTAMENTO' ? precioCasa : (habitacionesHotel[0]?.precioNoche || 350),
      moneda: 'BOB',
      calificacionPromedio: 5.0,
      totalResenas: 0,
      estado: 'PENDIENTE',
      estadoPublicacion: 'PENDIENTE',
      fotografias: fotosObj,
      unidades: unidadesFinales,
      estadoOperativo: 'LIBRE',
      reservas: []
    };

    try {
      const creado = await alojamientoService.crear(anfitrionClave, nuevoAlojamiento);
      onAlojamientoCreado(creado);
      setLoading(false);
      onClose();
    } catch (e: any) {
      console.warn('Error al guardar:', e);
      onAlojamientoCreado(nuevoAlojamiento);
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Wizard */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 uppercase tracking-widest">
                ASISTENTE DE PUBLICACIÓN
              </span>
              <span className="text-xs text-slate-400 font-medium">Paso {currentStep} de 5</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {currentStep === 1 && 'Selecciona la Modalidad de Hospedaje'}
              {currentStep === 2 && 'Identidad y Ubicación en Bolivia'}
              {currentStep === 3 && 'Servicios, Equipamiento & Confort'}
              {currentStep === 4 && 'Galería Fotográfica y Foto de Portada'}
              {currentStep === 5 && (modalidad === 'HOTEL_HOSTAL' ? 'Inventario de Habitaciones y Tarifas en BOB' : 'Capacidad y Tarifa de la Propiedad en BOB')}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progreso en 5 Pasos */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex-1 transition-all duration-300 ${
                step <= currentStep ? 'bg-blue-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Cuerpo del Asistente */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">

          {/* PASO 1: MODALIDAD */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona la categoría operativa que mejor describe tu establecimiento turístico:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setModalidad('CASA_DEPARTAMENTO')}
                  className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                    modalidad === 'CASA_DEPARTAMENTO'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-4 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Casa, Departamento o Cabaña Entera
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      El viajero reserva la propiedad completa de forma privada. Una sola tarifa por noche, dormitorios y capacidad total.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    Modalidad: CASA_DEPARTAMENTO
                  </span>
                </div>

                <div
                  onClick={() => setModalidad('HOTEL_HOSTAL')}
                  className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                    modalidad === 'HOTEL_HOSTAL'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-4 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Hotel className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Complejo Hotelero, Hostal o Posada
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Permite gestionar un catálogo de habitaciones independientes (Suite Presidencial, Doble Twin, Cabañas Familiares), cada una con sus propias fotos y tarifas.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Modalidad: HOTEL_HOSTAL (Multi-Habitaciones)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: IDENTIDAD & UBICACIÓN */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Alojamiento *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="ej. Gran Hotel Boutique Chiquitano Colonial"
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento de Bolivia *
                  </label>
                  <select
                    value={departamento}
                    onChange={e => setDepartamento(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {DEPARTAMENTOS_BOLIVIA.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad o Municipio *
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    placeholder="ej. Santa Cruz de la Sierra / Samaipata"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección o Referencia
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="ej. Av. San Martín #450, Barrio Equipetrol"
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Detallada para los Viajeros
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe la arquitectura, comodidades, cercanías turísticas y experiencia..."
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horario de Check-in
                  </label>
                  <input
                    type="text"
                    value={horarioEntrada}
                    onChange={e => setHorarioEntrada(e.target.value)}
                    placeholder="ej. 14:00 hrs"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horario de Check-out
                  </label>
                  <input
                    type="text"
                    value={horarioSalida}
                    onChange={e => setHorarioSalida(e.target.value)}
                    placeholder="ej. 11:00 hrs"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: SERVICIOS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona las comodidades que ofrece tu propiedad:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICIOS_DISPONIBLES.map(srv => {
                  const activo = serviciosSeleccionados.includes(srv);
                  return (
                    <div
                      key={srv}
                      onClick={() => toggleServicio(srv)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        activo
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/30'
                      }`}
                    >
                      <span className="text-xs">{srv}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition ${
                          activo ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {activo && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 4: FOTOS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Fotografías de la Propiedad ({fotos.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    La primera fotografía con estrella dorada será tu foto de portada en el catálogo nacional.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={e => handleArchivosLocales(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Subir desde Dispositivo</span>
                  </button>
                </div>
              </div>

              {/* Input URL rápido */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nuevaFotoUrl}
                  onChange={e => setNuevaFotoUrl(e.target.value)}
                  placeholder="O pega una URL de imagen (ej. Unsplash)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={agregarFotoPorUrl}
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Agregar Foto
                </button>
              </div>

              {/* Grilla de Fotos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {fotos.map((f, idx) => (
                  <div
                    key={f.id}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video group shadow-sm bg-slate-100 dark:bg-slate-950"
                  >
                    <img src={f.url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                    
                    {f.esPrincipal && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black shadow-md flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>PORTADA</span>
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!f.esPrincipal && (
                        <button
                          type="button"
                          onClick={() => marcarFotoPrincipal(f.id)}
                          className="p-1.5 rounded-xl bg-white text-slate-800 hover:bg-amber-400 hover:text-white transition shadow-sm text-xs font-bold"
                          title="Fijar como portada principal"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => eliminarFoto(f.id)}
                        className="p-1.5 rounded-xl bg-white text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
                        title="Eliminar fotografía"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO 5: TARIFAS & HABITACIONES */}
          {currentStep === 5 && (
            <div>
              {modalidad === 'CASA_DEPARTAMENTO' ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                    Estás configurando una <strong>Casa o Cabaña Privada Completa</strong>. Define los dormitorios y el precio total por noche en Bolivianos (BOB):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tarifa por Noche (BOB) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">Bs.</span>
                        <input
                          type="number"
                          value={precioCasa}
                          onChange={e => setPrecioCasa(Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Capacidad Total de Personas
                      </label>
                      <input
                        type="number"
                        value={capacidadCasa}
                        onChange={e => setCapacidadCasa(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cantidad de Dormitorios
                      </label>
                      <input
                        type="number"
                        value={dormitoriosCasa}
                        onChange={e => setDormitoriosCasa(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cantidad de Baños
                      </label>
                      <input
                        type="number"
                        value={banosCasa}
                        onChange={e => setBanosCasa(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        Inventario de Habitaciones del Hotel ({habitacionesHotel.length})
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cada habitación se publica como una unidad reservable independiente en el catálogo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditandoHabId(null);
                        setHabNombre(`Habitación ${habitacionesHotel.length + 1} - Suite`);
                        setHabCapacidad(2);
                        setHabCamas(1);
                        setHabBanos(1);
                        setHabInventario(3);
                        setHabPrecio(350);
                        setHabFotos([]);
                        setCreandoHabitacion(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Añadir Habitación</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {habitacionesHotel.map(hab => (
                      <div
                        key={hab.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={hab.fotos?.[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80'}
                            alt={hab.nombre}
                            className="w-16 h-14 object-cover rounded-xl"
                          />
                          <div>
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                              {hab.nombre}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Capacidad: {hab.capacidad} pers. • {hab.camas} camas • {hab.banos} baños • Inventario: {hab.inventarioTotal} unidades
                            </p>
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              Bs. {hab.precioNoche} / noche
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoHabId(hab.id);
                              setHabNombre(hab.nombre);
                              setHabCapacidad(hab.capacidad);
                              setHabCamas(hab.camas);
                              setHabBanos(hab.banos);
                              setHabInventario(hab.inventarioTotal);
                              setHabPrecio(hab.precioNoche);
                              setHabFotos(hab.fotos);
                              setCreandoHabitacion(true);
                            }}
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                            title="Editar habitación"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {habitacionesHotel.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHabitacionesHotel(prev => prev.filter(h => h.id !== hab.id))}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition"
                              title="Eliminar habitación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Submodal para Crear / Editar Habitación */}
        {creandoHabitacion && (
          <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
              {/* Header Fijo */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {editandoHabId ? 'Editar Habitación' : 'Añadir Nueva Habitación al Hotel'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Completa los detalles y confirma abajo para guardar
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreandoHabitacion(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario Scrolleable */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre o Categoría de la Habitación *
                  </label>
                  <input
                    type="text"
                    value={habNombre}
                    onChange={e => setHabNombre(e.target.value)}
                    placeholder="ej. Suite Ejecutiva Confort"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tarifa por Noche (BOB) *
                    </label>
                    <input
                      type="number"
                      value={habPrecio}
                      onChange={e => setHabPrecio(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inventario de Unidades
                    </label>
                    <input
                      type="number"
                      value={habInventario}
                      onChange={e => setHabInventario(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Capacidad (pers.)</label>
                    <input
                      type="number"
                      value={habCapacidad}
                      onChange={e => setHabCapacidad(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Camas</label>
                    <input
                      type="number"
                      value={habCamas}
                      onChange={e => setHabCamas(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Baños</label>
                    <input
                      type="number"
                      value={habBanos}
                      onChange={e => setHabBanos(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Sección de Fotografías de la Habitación */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Fotografías de esta Habitación ({habFotos.length})
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Sube imágenes reales (la primera será la portada).
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={habFileInputRef}
                      multiple
                      accept="image/*"
                      onChange={e => handleArchivosLocalesHabitacion(e.target.files)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={subiendoFotoHab}
                      onClick={() => habFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {subiendoFotoHab ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Subir Fotos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Input URL opcional */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="O pega enlace https://... de foto para la habitación"
                      value={nuevaFotoHabUrl}
                      onChange={e => setNuevaFotoHabUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarFotoHabPorUrl(); } }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={agregarFotoHabPorUrl}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      + Añadir
                    </button>
                  </div>

                  {/* Grid de miniaturas de la habitación */}
                  {habFotos.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-[11px]">
                      Aún no has agregado fotos para esta habitación. Sube al menos una foto para que se publique correctamente.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-40 overflow-y-auto">
                      {habFotos.map((f, idx) => (
                        <div
                          key={f.id}
                          className={`relative group aspect-video rounded-xl overflow-hidden border ${
                            f.esPrincipal ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <img src={f.url} alt={`Habitación ${idx + 1}`} className="w-full h-full object-cover" />
                          {f.esPrincipal && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                              Portada
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                            {!f.esPrincipal && (
                              <button
                                type="button"
                                onClick={() => marcarFotoPrincipalHab(f.id)}
                                className="p-1 rounded bg-white/90 text-amber-500 hover:bg-white text-xs"
                                title="Hacer portada de la habitación"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => eliminarFotoHab(f.id)}
                              className="p-1 rounded bg-red-600/90 text-white hover:bg-red-600 text-xs"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Fijo SIEMPRE Visible */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreandoHabitacion(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarHabitacionHotel}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aceptar y Guardar Habitación</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer con Acciones de Navegación */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentStep === 1 || loading}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              disabled={!puedeAvanzar() || loading}
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!puedeAvanzar() || loading}
              onClick={handleGuardarAlojamiento}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-blue-500/30 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando a Auditoría...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enviar Alojamiento a Auditoría</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};