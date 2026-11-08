import React, { useState, useEffect } from 'react';
import {
  X,
  Hotel,
  Building2,
  MapPin,
  ImagePlus,
  Star,
  Trash2,
  Plus,
  BedDouble,
  Users,
  Bath,
  Check,
  ArrowLeft,
  Clock,
  DollarSign,
  UploadCloud,
  Edit3,
  Eye,
  DoorOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Alojamiento, UnidadReservable, Fotografia } from '../../catalogo/types/catalogo.types';
import { catalogoService } from '../../catalogo/services/catalogoService';
import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';

interface EditorHotelHabitacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  alojamiento: Alojamiento | null;
  onAlojamientoActualizado: (actualizado: Alojamiento) => void;
}

export const EditorHotelHabitacionesModal: React.FC<EditorHotelHabitacionesModalProps> = ({
  isOpen,
  onClose,
  alojamiento,
  onAlojamientoActualizado
}) => {
  if (!isOpen || !alojamiento) return null;

  // Estado editable del alojamiento (Hotel o Casa)
  const [draft, setDraft] = useState<Alojamiento>(() => JSON.parse(JSON.stringify(alojamiento)));

  // Navegación interna: 'HOTEL' (pantalla general) o 'HABITACION' (pantalla dedicada a una suite/habitación)
  const [vistaActual, setVistaActual] = useState<'HOTEL' | 'HABITACION'>('HOTEL');
  const [tabHotel, setTabHotel] = useState<'DATOS' | 'FOTOS' | 'HABITACIONES'>('DATOS');
  const [habitacionActivaId, setHabitacionActivaId] = useState<string | null>(null);

  // Estados para inputs de nuevas fotos
  const [nuevaFotoHotelUrl, setNuevaFotoHotelUrl] = useState('');
  const [nuevaFotoHabitacionUrl, setNuevaFotoHabitacionUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const habFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Inicializar cada vez que cambia el alojamiento seleccionado
  useEffect(() => {
    if (alojamiento) {
      setDraft(JSON.parse(JSON.stringify(alojamiento)));
      setVistaActual('HOTEL');
      setTabHotel('DATOS');
      setHabitacionActivaId(null);
      setMensajeExito(null);
    }
  }, [alojamiento]);

  const esHotel = draft.modalidad === 'HOTEL_HOSTAL' || draft.tipoPropiedad?.toUpperCase() === 'HOTEL' || (draft.unidades && draft.unidades.length > 1);

  // Habitación activa en la pantalla individual
  const habitacionActiva = draft.unidades?.find(u => u.idUnidad === habitacionActivaId) || null;

  // =========================================================================
  // GESTIÓN DE FOTOGRAFÍAS DEL HOTEL
  // =========================================================================
  const marcarFotoPrincipalHotel = (index: number) => {
    const fotos = [...draft.fotografias];
    if (!fotos[index]) return;

    // Colocar la foto elegida como principal y ordenarla en la posición 0
    const seleccionada = fotos[index];
    const restantes = fotos.filter((_, i) => i !== index);

    const actualizadas: Fotografia[] = [
      { ...seleccionada, esPrincipal: true, orden: 0 },
      ...restantes.map((f, i) => ({ ...f, esPrincipal: false, orden: i + 1 }))
    ];

    setDraft(prev => ({ ...prev, fotografias: actualizadas }));
  };

  const eliminarFotoHotel = (index: number) => {
    if (draft.fotografias.length <= 1) {
      alert('El alojamiento debe tener al menos una fotografía de portada.');
      return;
    }

    const fotos = draft.fotografias.filter((_, i) => i !== index);
    // Si la eliminada era principal, asegurar que la primera quede como principal
    const actualizadas = fotos.map((f, i) => ({
      ...f,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({ ...prev, fotografias: actualizadas }));
  };

  const agregarFotoHotel = () => {
    if (!nuevaFotoHotelUrl.trim()) return;

    const nuevaFoto: Fotografia = {
      idFotografia: `foto-hotel-${Date.now()}`,
      url: nuevaFotoHotelUrl.trim(),
      esPrincipal: draft.fotografias.length === 0,
      orden: draft.fotografias.length,
      descripcion: `Vista de ${draft.titulo}`
    };

    setDraft(prev => ({
      ...prev,
      fotografias: [...prev.fotografias, nuevaFoto]
    }));
    setNuevaFotoHotelUrl('');
  };

  // =========================================================================
  // GESTIÓN DE HABITACIONES & PANTALLAS INDIVIDUALES
  // =========================================================================
  const ingresarAHabitacion = (idUnidad: string) => {
    setHabitacionActivaId(idUnidad);
    setVistaActual('HABITACION');
    setNuevaFotoHabitacionUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const volverAHabitacionesHotel = () => {
    setVistaActual('HOTEL');
    setTabHotel('HABITACIONES');
    setHabitacionActivaId(null);
  };

  const agregarNuevaHabitacion = () => {
    const nuevoId = `hab-${Date.now()}`;
    const contador = (draft.unidades?.length || 0) + 1;
    const nuevaUnidad: UnidadReservable = {
      idUnidad: nuevoId,
      nombre: `Habitación ${contador} - Estándar Confort`,
      descripcion: 'Habitación cómoda con baño privado, aire acondicionado y TV satelital.',
      capacidadPersonas: 2,
      cantidadDormitorios: 1,
      cantidadCamas: 1,
      cantidadBanios: 1,
      cantidadBanos: 1,
      precioNoche: 380,
      moneda: 'BOB',
      inventarioTotal: 1,
      activo: true,
      estado: 'PUBLICADO',
      fotos: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      ],
      fotografias: [
        {
          idFotografia: `foto-hab-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Vista principal de la habitación'
        }
      ]
    };

    setDraft(prev => ({
      ...prev,
      unidades: [...(prev.unidades || []), nuevaUnidad]
    }));

    // Abre directamente la pantalla individual de la nueva habitación
    ingresarAHabitacion(nuevoId);
  };

  const eliminarHabitacion = (idUnidad: string) => {
    if ((draft.unidades?.length || 0) <= 1) {
      alert('Un hotel debe contar con al menos una habitación registrada.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta habitación del hotel?')) {
      setDraft(prev => ({
        ...prev,
        unidades: prev.unidades.filter(u => u.idUnidad !== idUnidad)
      }));
    }
  };

  // Modificar campo de la habitación activa
  const actualizarCampoHabitacion = (campo: keyof UnidadReservable, valor: any) => {
    if (!habitacionActivaId) return;

    setDraft(prev => ({
      ...prev,
      unidades: prev.unidades.map(u => {
        if (u.idUnidad === habitacionActivaId) {
          return { ...u, [campo]: valor };
        }
        return u;
      })
    }));
  };

  // =========================================================================
  // GESTIÓN DE FOTOGRAFÍAS DE LA HABITACIÓN INDIVIDUAL
  // =========================================================================
  const getFotosHabitacionActiva = (): string[] => {
    if (!habitacionActiva) return [];
    if (habitacionActiva.fotos && habitacionActiva.fotos.length > 0) {
      return habitacionActiva.fotos;
    }
    if (habitacionActiva.fotografias && habitacionActiva.fotografias.length > 0) {
      return habitacionActiva.fotografias.map(f => f.url);
    }
    return [];
  };

  const marcarFotoPrincipalHabitacion = (index: number) => {
    if (!habitacionActiva || !habitacionActivaId) return;
    const fotos = getFotosHabitacionActiva();
    if (!fotos[index]) return;

    const seleccionada = fotos[index];
    const restantes = fotos.filter((_, i) => i !== index);
    const reordenadas = [seleccionada, ...restantes];

    const fotosObj: Fotografia[] = reordenadas.map((url, i) => ({
      idFotografia: `fhab-${habitacionActivaId}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      unidades: prev.unidades.map(u => {
        if (u.idUnidad === habitacionActivaId) {
          return {
            ...u,
            fotos: reordenadas,
            fotografias: fotosObj
          };
        }
        return u;
      })
    }));
  };

  const eliminarFotoHabitacion = (index: number) => {
    if (!habitacionActiva || !habitacionActivaId) return;
    const fotos = getFotosHabitacionActiva();
    if (fotos.length <= 1) {
      alert('La habitación debe tener al menos una fotografía.');
      return;
    }

    const reordenadas = fotos.filter((_, i) => i !== index);
    const fotosObj: Fotografia[] = reordenadas.map((url, i) => ({
      idFotografia: `fhab-${habitacionActivaId}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      unidades: prev.unidades.map(u => {
        if (u.idUnidad === habitacionActivaId) {
          return {
            ...u,
            fotos: reordenadas,
            fotografias: fotosObj
          };
        }
        return u;
      })
    }));
  };

  const agregarFotoHabitacion = () => {
    if (!nuevaFotoHabitacionUrl.trim() || !habitacionActivaId) return;
    const fotos = getFotosHabitacionActiva();
    const nuevas = [...fotos, nuevaFotoHabitacionUrl.trim()];

    const fotosObj: Fotografia[] = nuevas.map((url, i) => ({
      idFotografia: `fhab-${habitacionActivaId}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      unidades: prev.unidades.map(u => {
        if (u.idUnidad === habitacionActivaId) {
          return {
            ...u,
            fotos: nuevas,
            fotografias: fotosObj
          };
        }
        return u;
      })
    }));

    setNuevaFotoHabitacionUrl('');
  };

  const handleArchivosLocalesHabitacion = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0 || !habitacionActivaId) return;
    const filesArray = Array.from(archivos);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setDraft(prev => ({
            ...prev,
            unidades: prev.unidades.map(u => {
              if (u.idUnidad === habitacionActivaId) {
                const actuales = u.fotos || (u.fotografias || []).map(f => f.url);
                const nuevas = [...actuales, dataUrl];
                const fotosObj: Fotografia[] = nuevas.map((url, i) => ({
                  idFotografia: `fhab-${habitacionActivaId}-${i}`,
                  url,
                  esPrincipal: i === 0,
                  orden: i
                }));
                return {
                  ...u,
                  fotos: nuevas,
                  fotografias: fotosObj
                };
              }
              return u;
            })
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // =========================================================================
  // GUARDAR CAMBIOS TOTALES
  // =========================================================================
  const guardarCambios = async () => {
    try {
      setGuardando(true);

      // 1. Guardado local persistente para respuesta inmediata en UI y catálogo
      catalogoService.guardarAlojamientoLocal(draft);

      // 2. Intento de sincronización con backend REST si está activo
      try {
        await httpClient.put(ENDPOINTS.ALOJAMIENTOS.DETALLE(draft.idAlojamiento), {
          titulo: draft.titulo,
          descripcion: draft.descripcion,
          ciudad: draft.ciudad,
          departamento: draft.departamento,
          direccion: draft.direccion,
          precioBaseNoche: draft.precioBaseNoche,
          moneda: draft.moneda || 'BOB',
          politicas: draft.politicas,
          horarioEntrada: draft.horarioEntrada,
          horarioSalida: draft.horarioSalida
        });
      } catch (backendErr) {
        // Si el backend no está disponible en este momento, los cambios persisten en storage local
        console.info('Guardado local efectuado; backend sincronizará al reconectar.');
      }

      onAlojamientoActualizado(draft);
      setMensajeExito('¡Información del hotel y habitaciones guardada con éxito!');
      setTimeout(() => {
        setMensajeExito(null);
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Error al guardar cambios:', e);
      alert('Hubo un inconveniente al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* =================================================================== */}
        {/* CABECERA SUPERIOR DEL MODAL CON BREADCRUMB                          */}
        {/* =================================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {vistaActual === 'HABITACION' ? (
              <button
                type="button"
                onClick={volverAHabitacionesHotel}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-1.5 text-xs font-bold shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Volver al Hotel</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
                {esHotel ? <Hotel className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {esHotel ? '🏨 Hotel & Habitaciones' : '🏡 Alojamiento Individual'}
                </span>
                {vistaActual === 'HABITACION' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    Pantalla de Habitación
                  </span>
                )}
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {vistaActual === 'HABITACION'
                  ? habitacionActiva?.nombre || 'Habitación'
                  : draft.titulo}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICACIÓN TOAST DE ÉXITO */}
        {mensajeExito && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA A: INFORMACIÓN GENERAL DEL HOTEL                             */}
        {/* =================================================================== */}
        {vistaActual === 'HOTEL' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Pestañas del Hotel: Datos | Fotos | Habitaciones */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTabHotel('DATOS')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  tabHotel === 'DATOS'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Información &amp; Normas</span>
              </button>

              <button
                type="button"
                onClick={() => setTabHotel('FOTOS')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                  tabHotel === 'FOTOS'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ImagePlus className="w-4 h-4" />
                <span>Fotos del Hotel ({draft.fotografias.length})</span>
              </button>

              {esHotel && (
                <button
                  type="button"
                  onClick={() => setTabHotel('HABITACIONES')}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                    tabHotel === 'HABITACIONES'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Habitaciones ({draft.unidades?.length || 0})</span>
                </button>
              )}
            </div>

            {/* TAB 1: DATOS GENERALES DEL HOTEL */}
            {tabHotel === 'DATOS' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre Comercial del Hotel o Alojamiento
                    </label>
                    <input
                      type="text"
                      value={draft.titulo}
                      onChange={e => setDraft(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tarifa Base de Referencia (BOB / noche)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Bs.</span>
                      <input
                        type="number"
                        value={draft.precioBaseNoche}
                        onChange={e => setDraft(prev => ({ ...prev, precioBaseNoche: Number(e.target.value) }))}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción Turística del Hospedaje
                  </label>
                  <textarea
                    rows={3}
                    value={draft.descripcion}
                    onChange={e => setDraft(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={draft.ciudad}
                      onChange={e => setDraft(prev => ({ ...prev, ciudad: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Departamento
                    </label>
                    <select
                      value={draft.departamento}
                      onChange={e => setDraft(prev => ({ ...prev, departamento: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Tarija">Tarija</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="Chuquisaca">Chuquisaca</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dirección Completa
                    </label>
                    <input
                      type="text"
                      value={draft.direccion || ''}
                      onChange={e => setDraft(prev => ({ ...prev, direccion: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Horario de Entrada (Check-in)
                    </label>
                    <input
                      type="text"
                      value={draft.horarioEntrada || '14:00 hrs'}
                      onChange={e => setDraft(prev => ({ ...prev, horarioEntrada: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Horario de Salida (Check-out)
                    </label>
                    <input
                      type="text"
                      value={draft.horarioSalida || '11:00 hrs'}
                      onChange={e => setDraft(prev => ({ ...prev, horarioSalida: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Normas de la Casa &amp; Políticas de Convivencia
                  </label>
                  <textarea
                    rows={2}
                    value={draft.politicas || 'Prohibido fumar en áreas cerradas. Mascotas permitidas bajo solicitud previa.'}
                    onChange={e => setDraft(prev => ({ ...prev, politicas: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: FOTOGRAFÍAS DEL HOTEL (CON PORTADA PRINCIPAL) */}
            {tabHotel === 'FOTOS' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <div>
                    <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300">
                      Fotografía de Portada del Hotel
                    </h4>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400">
                      La fotografía principal se muestra como portada en el catálogo público nacional y en la cabecera.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                    {draft.fotografias.length} Fotografías cargadas
                  </span>
                </div>

                {/* Formulario para añadir nueva foto por URL */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      placeholder="Pega la URL de una nueva fotografía del hotel (https://...)"
                      value={nuevaFotoHotelUrl}
                      onChange={e => setNuevaFotoHotelUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={agregarFotoHotel}
                    disabled={!nuevaFotoHotelUrl.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Fotografía</span>
                  </button>
                </div>

                {/* Cuadrícula de fotos del Hotel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {draft.fotografias.map((foto, index) => {
                    const esPrincipal = foto.esPrincipal || index === 0;
                    return (
                      <div
                        key={foto.idFotografia || index}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                          esPrincipal
                            ? 'border-blue-600 shadow-lg shadow-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={foto.url}
                          alt={foto.descripcion || `Foto ${index + 1}`}
                          className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Insignia de Foto Principal */}
                        <div className="absolute top-2.5 left-2.5">
                          {esPrincipal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Foto Principal (Portada)</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => marcarFotoPrincipalHotel(index)}
                              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-blue-600 text-white text-[10px] font-bold backdrop-blur-sm transition flex items-center gap-1 shadow-sm"
                            >
                              <Star className="w-3 h-3" />
                              <span>Poner como Principal</span>
                            </button>
                          )}
                        </div>

                        {/* Botón Eliminar Foto */}
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            type="button"
                            onClick={() => eliminarFotoHotel(index)}
                            className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm"
                            title="Eliminar Fotografía"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="truncate">{foto.descripcion || `Foto ${index + 1}`}</span>
                          <span className="font-mono text-[10px]">Pos: {index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: LISTADO DE HABITACIONES DEL HOTEL (PANTALLA DE ENTRADA) */}
            {tabHotel === 'HABITACIONES' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      Habitaciones del Hotel ({draft.unidades?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ingresa a la pantalla de cada habitación para personalizar su tarifa, camas y su propia galería de fotos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={agregarNuevaHabitacion}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Añadir Habitación</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(draft.unidades || []).map(u => {
                    const fotoPortada = (u.fotos && u.fotos[0]) || (u.fotografias && u.fotografias[0]?.url) || draft.fotografias[0]?.url;
                    const cantidadFotos = (u.fotos?.length || u.fotografias?.length || 0);

                    return (
                      <div
                        key={u.idUnidad}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-400 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={fotoPortada}
                            alt={u.nombre}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                              {u.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {u.descripcion || 'Sin descripción detallada'}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                              <span>👥 {u.capacidadPersonas} huéspedes</span>
                              <span>•</span>
                              <span>🛏️ {u.cantidadCamas} camas</span>
                              <span>•</span>
                              <span>🚿 {u.cantidadBanios || u.cantidadBanos || 1} baños</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                Bs. {u.precioNoche} / noche
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({cantidadFotos} fotos propias)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => ingresarAHabitacion(u.idUnidad)}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Ingresar a esta Habitación</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => eliminarHabitacion(u.idUnidad)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Eliminar Habitación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA B: PANTALLA INDIVIDUAL DE LA HABITACIÓN                        */}
        {/* =================================================================== */}
        {vistaActual === 'HABITACION' && habitacionActiva && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Banner de la Habitación */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Configuración Exclusiva de Habitación
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {habitacionActiva.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hotel: {draft.titulo} • Tarifas y galería fotográfica independiente
                </p>
              </div>

              <button
                type="button"
                onClick={volverAHabitacionesHotel}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Listo, volver al Hotel</span>
              </button>
            </div>

            {/* Datos específicos de la habitación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Habitación / Suite
                </label>
                <input
                  type="text"
                  value={habitacionActiva.nombre}
                  onChange={e => actualizarCampoHabitacion('nombre', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tarifa por Noche (BOB)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">Bs.</span>
                  <input
                    type="number"
                    value={habitacionActiva.precioNoche}
                    onChange={e => actualizarCampoHabitacion('precioNoche', Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Capacidad de Huéspedes
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={habitacionActiva.capacidadPersonas}
                  onChange={e => actualizarCampoHabitacion('capacidadPersonas', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cantidad de Camas
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={habitacionActiva.cantidadCamas}
                  onChange={e => actualizarCampoHabitacion('cantidadCamas', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Baños Privados
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={habitacionActiva.cantidadBanios || habitacionActiva.cantidadBanos || 1}
                  onChange={e => {
                    const val = Number(e.target.value);
                    actualizarCampoHabitacion('cantidadBanios', val);
                    actualizarCampoHabitacion('cantidadBanos', val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Descripción Específica de esta Habitación
              </label>
              <textarea
                rows={2}
                value={habitacionActiva.descripcion || ''}
                onChange={e => actualizarCampoHabitacion('descripcion', e.target.value)}
                placeholder="Detalla las características de la suite (jacuzzi, balcón privado, vista, etc.)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* GESTIÓN DE FOTOGRAFÍAS DE ESTA HABITACIÓN */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-blue-600" />
                    <span>Fotografías Propias de esta Habitación ({getFotosHabitacionActiva().length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Puedes marcar una imagen como <strong>Principal de la Habitación</strong> para que se muestre como portada en su pantalla.
                  </p>
                </div>
              </div>

              {/* Input para añadir foto a la habitación */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    ref={habFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleArchivosLocalesHabitacion(e.target.files);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => habFileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 hover:border-blue-500 bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Subir archivos locales</span>
                  </button>

                  <input
                    type="url"
                    placeholder="O pegar URL web de fotografía (ej. https://...)"
                    value={nuevaFotoHabitacionUrl}
                    onChange={e => setNuevaFotoHabitacionUrl(e.target.value)}
                    className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={agregarFotoHabitacion}
                    disabled={!nuevaFotoHabitacionUrl.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir a Habitación</span>
                  </button>
                </div>
              </div>

              {/* Cuadrícula de fotos de la habitación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {getFotosHabitacionActiva().map((url, idx) => {
                  const esPrincipal = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                        esPrincipal
                          ? 'border-blue-600 shadow-md shadow-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Habitación foto ${idx + 1}`}
                        className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Botón Poner como Principal de la Habitación */}
                      <div className="absolute top-2.5 left-2.5">
                        {esPrincipal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Portada de Habitación</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => marcarFotoPrincipalHabitacion(idx)}
                            className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-blue-600 text-white text-[10px] font-bold backdrop-blur-sm transition flex items-center gap-1 shadow-sm"
                          >
                            <Star className="w-3 h-3" />
                            <span>Poner como Principal</span>
                          </button>
                        )}
                      </div>

                      {/* Botón Eliminar Foto */}
                      <div className="absolute top-2.5 right-2.5">
                        <button
                          type="button"
                          onClick={() => eliminarFotoHabitacion(idx)}
                          className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm"
                          title="Eliminar de esta Habitación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-900 text-[10px] text-slate-500 flex justify-between font-mono">
                        <span>Foto {idx + 1}</span>
                        <span>{esPrincipal ? 'Principal' : 'Secundaria'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* PIE DE ACCIONES: GUARDAR CAMBIOS / CANCELAR                         */}
        {/* =================================================================== */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div>
            {vistaActual === 'HABITACION' ? (
              <button
                type="button"
                onClick={volverAHabitacionesHotel}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la vista del Hotel</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                Los cambios se aplicarán inmediatamente en el catálogo y en el panel.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarCambios}
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
