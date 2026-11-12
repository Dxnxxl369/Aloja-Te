import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Hotel,
  Building2,
  ImagePlus,
  DoorOpen,
  Plus,
  Star,
  Trash2,
  Edit3,
  CalendarCheck,
  UploadCloud,
  Loader2,
  AlertTriangle,
  AlertOctagon,
  Ban,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { Alojamiento, UnidadReservable, Fotografia, Valoracion, ResumenValoraciones } from '../../../core/types/anfitrion.types';
import { PantallaHabitacionIndividual } from './PantallaHabitacionIndividual';

interface EditorHotelPantallaProps {
  alojamiento: Alojamiento;
  onVolver: () => void;
  onGuardarHotel: (actualizado: Alojamiento) => void;
  habitacionEnPantallaIdInicial?: string | null;
  onCambiarHabitacion?: (idHabitacion: string | null) => void;
}

// Función pura para calcular métricas verdaderas sin datos ficticios superpuestos
interface MetricasResenas {
  total: number;
  promedioGeneral: number | null;
  promedioLimpieza: number | null;
  promedioUbicacion: number | null;
  promedioCalidadPrecio: number | null;
  promedioServicio: number | null;
  promedioComodidad: number | null;
}

const calcularMetricasReales = (lista: Valoracion[]): MetricasResenas => {
  if (!lista || lista.length === 0) {
    return {
      total: 0,
      promedioGeneral: null,
      promedioLimpieza: null,
      promedioUbicacion: null,
      promedioCalidadPrecio: null,
      promedioServicio: null,
      promedioComodidad: null
    };
  }

  let sumGen = 0, sumLimp = 0, sumUbi = 0, sumCal = 0, sumServ = 0, sumCom = 0;
  let countLimp = 0, countUbi = 0, countCal = 0, countServ = 0, countCom = 0;

  for (const r of lista) {
    sumGen += Number(r.puntuacionGeneral || 0);

    if (r.calificacionLimpieza != null) {
      sumLimp += Number(r.calificacionLimpieza);
      countLimp++;
    }
    if (r.calificacionUbicacion != null) {
      sumUbi += Number(r.calificacionUbicacion);
      countUbi++;
    }
    if (r.calificacionCalidadPrecio != null) {
      sumCal += Number(r.calificacionCalidadPrecio);
      countCal++;
    }
    if (r.calificacionServicio != null) {
      sumServ += Number(r.calificacionServicio);
      countServ++;
    }
    if (r.calificacionComodidad != null) {
      sumCom += Number(r.calificacionComodidad);
      countCom++;
    }
  }

  const total = lista.length;
  return {
    total,
    promedioGeneral: Number((sumGen / total).toFixed(1)),
    promedioLimpieza: countLimp > 0 ? Number((sumLimp / countLimp).toFixed(1)) : null,
    promedioUbicacion: countUbi > 0 ? Number((sumUbi / countUbi).toFixed(1)) : null,
    promedioCalidadPrecio: countCal > 0 ? Number((sumCal / countCal).toFixed(1)) : null,
    promedioServicio: countServ > 0 ? Number((sumServ / countServ).toFixed(1)) : null,
    promedioComodidad: countCom > 0 ? Number((sumCom / countCom).toFixed(1)) : null
  };
};

export const EditorHotelPantalla: React.FC<EditorHotelPantallaProps> = ({
  alojamiento,
  onVolver,
  onGuardarHotel,
  habitacionEnPantallaIdInicial,
  onCambiarHabitacion
}) => {
  const [draft, setDraft] = useState<Alojamiento>(() => JSON.parse(JSON.stringify(alojamiento)));
  const [tabActual, setTabActual] = useState<'DATOS' | 'FOTOS' | 'HABITACIONES' | 'RESENAS'>('DATOS');
  const [alertaFotosExpandida, setAlertaFotosExpandida] = useState(false);

  // Reseñas reales desde el backend
  const [resenas, setResenas] = useState<Valoracion[]>([]);
  const [resumenResenas, setResumenResenas] = useState<ResumenValoraciones | null>(null);
  const [cargandoResenas, setCargandoResenas] = useState(false);
  const [filtroUnidadResena, setFiltroUnidadResena] = useState<string>('TODAS');

  const estModeracion = draft.estadoPublicacion || draft.estado || 'PUBLICADO';
  const motivoModeracion = draft.motivoObservacionRechazo || draft.motivoRechazo || '';

  // Extracción de índices de fotos afectadas en el mensaje de moderación (ej: "foto 2", "foto 3")
  const fotosAfectadas = useMemo(() => {
    if (!motivoModeracion) return [];
    const matches = motivoModeracion.matchAll(/foto\s+(\d+)/gi);
    const indices: number[] = [];
    for (const m of matches) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num)) indices.push(num);
    }
    return Array.from(new Set(indices));
  }, [motivoModeracion]);

  const cargarResenas = useCallback(async () => {
    const id = draft.idAlojamiento || (draft as any).id;
    if (!id) return;
    setCargandoResenas(true);
    try {
      const resp = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/valoraciones`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) setResenas(data);
      }
      const respRes = await fetch(`http://localhost:8080/api/v1/alojamientos/${id}/valoraciones/resumen`);
      if (respRes.ok) {
        const dataRes = await respRes.json();
        setResumenResenas(dataRes);
      }
    } catch (err) {
      console.warn('Error al cargar reseñas del alojamiento:', err);
    } finally {
      setCargandoResenas(false);
    }
  }, [draft.idAlojamiento]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);
  
  // Si se entra a la pantalla individual de una habitación específica:
  const [habitacionEnPantallaId, setHabitacionEnPantallaIdState] = useState<string | null>(
    () => habitacionEnPantallaIdInicial || null
  );

  const cambiarHabitacion = (id: string | null) => {
    setHabitacionEnPantallaIdState(id);
    onCambiarHabitacion?.(id);
  };

  React.useEffect(() => {
    if (habitacionEnPantallaIdInicial !== undefined) {
      setHabitacionEnPantallaIdState(habitacionEnPantallaIdInicial);
    }
  }, [habitacionEnPantallaIdInicial]);
  const [nuevaFotoHotelUrl, setNuevaFotoHotelUrl] = useState('');
  const [subiendoFotoHotel, setSubiendoFotoHotel] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleArchivosLocalesHotel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSubiendoFotoHotel(true);
    try {
      const nuevasFotos: Fotografia[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('file', file);
        try {
          let res = await fetch('http://localhost:8080/api/v1/alojamientos/imagenes?carpeta=alojamientos', {
            method: 'POST',
            body: formData
          });
          if (!res.ok) {
            res = await fetch('http://localhost:3001/api/v1/alojamientos/imagenes?carpeta=alojamientos', {
              method: 'POST',
              body: formData
            });
          }
          if (res.ok) {
            const data = await res.json();
            const urlFinal = data.url || data.secure_url || data.imagenUrl;
            if (urlFinal) {
              nuevasFotos.push({
                idFotografia: `fhot-${Date.now()}-${i}`,
                url: urlFinal,
                esPrincipal: draft.fotografias.length === 0 && nuevasFotos.length === 0,
                orden: draft.fotografias.length + nuevasFotos.length,
                descripcion: `Foto de ${draft.titulo}`
              });
            }
          }
        } catch (err) {
          console.warn('Error subiendo imagen al backend:', err);
        }
      }
      if (nuevasFotos.length > 0) {
        setDraft(prev => ({ ...prev, fotografias: [...prev.fotografias, ...nuevasFotos] }));
      }
    } finally {
      setSubiendoFotoHotel(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const esHotel = draft.modalidad === 'HOTEL_HOSTAL' || draft.tipoPropiedad?.toUpperCase() === 'HOTEL' || (draft.unidades && draft.unidades.length > 1);

  // =========================================================================
  // GESTIÓN FOTOS DEL HOTEL
  // =========================================================================
  const marcarFotoPrincipalHotel = (index: number) => {
    const fotos = [...draft.fotografias];
    if (!fotos[index]) return;

    const seleccionada = fotos[index];
    const restantes = fotos.filter((_, i) => i !== index);

    const reordenadas: Fotografia[] = [
      { ...seleccionada, esPrincipal: true, orden: 0 },
      ...restantes.map((f, i) => ({ ...f, esPrincipal: false, orden: i + 1 }))
    ];

    setDraft(prev => ({ ...prev, fotografias: reordenadas }));
  };

  const eliminarFotoHotel = (index: number) => {
    if (draft.fotografias.length <= 1) {
      alert('El hotel debe contar con al menos una fotografía de portada.');
      return;
    }
    const fotos = draft.fotografias.filter((_, i) => i !== index);
    const reordenadas = fotos.map((f, i) => ({
      ...f,
      esPrincipal: i === 0,
      orden: i
    }));
    setDraft(prev => ({ ...prev, fotografias: reordenadas }));
  };

  const agregarFotoHotel = () => {
    if (!nuevaFotoHotelUrl.trim()) return;
    const nueva: Fotografia = {
      idFotografia: `fhot-${Date.now()}`,
      url: nuevaFotoHotelUrl.trim(),
      esPrincipal: draft.fotografias.length === 0,
      orden: draft.fotografias.length,
      descripcion: `Vista de ${draft.titulo}`
    };
    setDraft(prev => ({ ...prev, fotografias: [...prev.fotografias, nueva] }));
    setNuevaFotoHotelUrl('');
  };

  // =========================================================================
  // GESTIÓN HABITACIONES
  // =========================================================================
  const agregarHabitacion = () => {
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
      estadoOperativo: 'LIBRE',
      fotos: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'
      ],
      fotografias: [
        {
          idFotografia: `fhab-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
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
    cambiarHabitacion(nuevoId);
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

  const guardarHabitacionModificada = (actualizada: UnidadReservable) => {
    const nuevoDraft: Alojamiento = {
      ...draft,
      unidades: (draft.unidades || []).map(u => u.idUnidad === actualizada.idUnidad ? actualizada : u)
    };
    setDraft(nuevoDraft);
    onGuardarHotel(nuevoDraft);
    cambiarHabitacion(null);
  };

  const habitacionActiva = draft.unidades?.find(u => u.idUnidad === habitacionEnPantallaId) || null;

  // Si el usuario está dentro de la pantalla individual de una habitación:
  if (habitacionEnPantallaId && habitacionActiva) {
    return (
      <PantallaHabitacionIndividual
        habitacion={habitacionActiva}
        hotelTitulo={draft.titulo}
        alojamientoId={draft.idAlojamiento || (draft as any).id}
        motivoObservacion={draft.motivoObservacionRechazo || draft.motivoRechazo}
        estadoAlojamiento={draft.estadoPublicacion || draft.estado}
        onVolver={() => cambiarHabitacion(null)}
        onGuardarHabitacion={guardarHabitacionModificada}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Cabecera del Editor con Breadcrumbs y Guardar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolver}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-2 text-xs font-bold shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Volver a Mis Alojamientos</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                {esHotel ? '🏨 Hotel & Habitaciones' : '🏡 Alojamiento Individual'}
              </span>
              <span className="text-xs text-slate-400">
                {draft.ciudad}, {draft.departamento}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {draft.titulo}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => onGuardarHotel(draft)}
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Banner de Estado de Moderación Administrativa */}
      {(() => {
        const est = draft.estadoPublicacion || draft.estado || 'PUBLICADO';
        const motivo = draft.motivoObservacionRechazo || draft.motivoRechazo;

        if (est === 'RECHAZADO') {
          return (
            <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
                    ⛔ Estado: Rechazado por Seguridad
                  </span>
                  <span>Infracción Detectada en Fotografías</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const actualizado: Alojamiento = {
                      ...draft,
                      estado: 'EN_REVISION',
                      estadoPublicacion: 'EN_REVISION',
                      motivoObservacionRechazo: undefined
                    };
                    setDraft(actualizado);
                    onGuardarHotel(actualizado);
                    try {
                      await fetch(`http://localhost:8080/api/v1/alojamientos/${draft.idAlojamiento || (draft as any).id}/enviar-revision`, {
                        method: 'POST'
                      });
                    } catch (e) {
                      console.warn('Error al solicitar re-auditoría:', e);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  ✓ Subsanar y Solicitar Re-auditoría
                </button>
              </div>
              {motivo && (
                <p className="italic bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-rose-200 dark:border-rose-900">
                  <strong>Detalle del Rechazo:</strong> "{motivo}"
                </p>
              )}
            </div>
          );
        }

        if (est === 'OBSERVADO') {
          return (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
                    ⚠️ Estado: Observado por Auditoría
                  </span>
                  <span>Requiere Correcciones</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const actualizado: Alojamiento = {
                      ...draft,
                      estado: 'EN_REVISION',
                      estadoPublicacion: 'EN_REVISION',
                      motivoObservacionRechazo: undefined
                    };
                    setDraft(actualizado);
                    onGuardarHotel(actualizado);
                    try {
                      await fetch(`http://localhost:8080/api/v1/alojamientos/${draft.idAlojamiento || (draft as any).id}/enviar-revision`, {
                        method: 'POST'
                      });
                    } catch (e) {
                      console.warn('Error al solicitar re-auditoría:', e);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  ✓ Subsanar y Solicitar Re-auditoría
                </button>
              </div>
              {motivo && (
                <p className="italic bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <strong>Detalle de la Observación:</strong> "{motivo}"
                </p>
              )}
            </div>
          );
        }

        if (est === 'PENDIENTE' || est === 'EN_REVISION') {
          return (
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
              <div className="flex items-center gap-2.5 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{est === 'EN_REVISION' ? '🤖 IA de Visión Analizando...' : '🕒 En Cola de Auditoría'}</span>
                </span>
                <span>
                  {est === 'EN_REVISION'
                    ? 'La IA y el motor de visión están analizando las fotos y contenidos en segundo plano.'
                    : 'Alojamiento listo para ser re-auditado por la automatización.'}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setDraft(prev => ({ ...prev, estado: 'EN_REVISION', estadoPublicacion: 'EN_REVISION' }));
                  try {
                    await fetch(`http://localhost:8080/api/v1/alojamientos/${draft.idAlojamiento || (draft as any).id}/enviar-revision`, {
                      method: 'POST'
                    });
                  } catch (e) {
                    console.warn('Error al forzar re-auditoría:', e);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>⚡ Re-auditar con IA Ahora</span>
              </button>
            </div>
          );
        }

        if (est === 'PUBLICADO') {
          return (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                  Publicado en Catálogo
                </span>                
              </div>
              <button
                type="button"
                onClick={() => {
                  const actualizado: Alojamiento = {
                    ...draft,
                    estado: 'SUSPENDIDO',
                    estadoPublicacion: 'SUSPENDIDO',
                    motivoObservacionRechazo: 'Pausado temporalmente a solicitud del anfitrión.'
                  };
                  setDraft(actualizado);
                  onGuardarHotel(actualizado);
                }}
                className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-bold text-[11px] transition cursor-pointer"
              >
                ⛔ Pausar Publicación
              </button>
            </div>
          );
        }

        if (est === 'SUSPENDIDO') {
          return (
            <div className="p-4 rounded-3xl bg-[#4a1525]/15 dark:bg-[#4a1525]/30 border border-[#801b38]/40 dark:border-[#801b38]/60 flex items-center justify-between gap-3 text-xs text-[#5c1328] dark:text-[#f8b4c8]">
              <div className="flex items-center gap-2 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-[#801b38] text-white text-[10px]">
                  ⛔ Estado: Suspendido Temporalmente
                </span>
                <span>La propiedad se encuentra oculta en el catálogo para los viajeros.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const actualizado: Alojamiento = {
                    ...draft,
                    estado: 'PUBLICADO',
                    estadoPublicacion: 'PUBLICADO',
                    motivoObservacionRechazo: undefined
                  };
                  setDraft(actualizado);
                  onGuardarHotel(actualizado);
                }}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
              >
                ▶️ Reanudar Publicación
              </button>
            </div>
          );
        }

        return null;
      })()}

      {/* Pestañas de Navegación del Hotel */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold flex-wrap">
        <button
          type="button"
          onClick={() => setTabActual('DATOS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            tabActual === 'DATOS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Información General &amp; Normas</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActual('FOTOS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            tabActual === 'FOTOS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          <span>{esHotel ? 'Fotos del Hotel' : 'Fotos de la Propiedad'} ({draft.fotografias.length})</span>
        </button>

        {esHotel && (
          <button
            type="button"
            onClick={() => setTabActual('HABITACIONES')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              tabActual === 'HABITACIONES'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Habitaciones del Hotel ({draft.unidades?.length || 0})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setTabActual('RESENAS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            tabActual === 'RESENAS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reseñas &amp; Calificaciones {resenas.length > 0 ? `(${resenas.length})` : ''}</span>
        </button>
      </div>

      {/* PESTAÑA 1: DATOS GENERALES */}
      {tabActual === 'DATOS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Comercial del Hotel / Alojamiento
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
              Descripción para Huéspedes &amp; Viajeros
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Normas de Hospedaje &amp; Políticas
            </label>
            <textarea
              rows={2}
              value={draft.politicas || 'Prohibido fumar en habitaciones cerradas. Recepción 24 horas.'}
              onChange={e => setDraft(prev => ({ ...prev, politicas: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* PESTAÑA 2: FOTOGRAFÍAS */}
      {tabActual === 'FOTOS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Alerta de Auditoría Visual en Fotos (Solo si está OBSERVADO, RECHAZADO o SUSPENDIDO) */}
          {(estModeracion === 'OBSERVADO' || estModeracion === 'RECHAZADO' || estModeracion === 'SUSPENDIDO') && (
            <div className={`p-4 rounded-2xl transition-all duration-300 border text-xs ${
              estModeracion === 'RECHAZADO'
                ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : estModeracion === 'OBSERVADO'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                : 'bg-[#4a1525]/15 dark:bg-[#4a1525]/30 border-[#801b38]/40 dark:border-[#801b38]/60 text-[#5c1328] dark:text-[#f8b4c8]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {estModeracion === 'RECHAZADO' ? (
                    <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : estModeracion === 'OBSERVADO' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Ban className="w-5 h-5 text-[#801b38] dark:text-[#f8b4c8] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {estModeracion === 'RECHAZADO'
                        ? 'Fotografías Rechazadas por Seguridad / IA'
                        : estModeracion === 'OBSERVADO'
                        ? 'Fotografías Observadas por Auditoría'
                        : 'Alojamiento Suspendido - Fotografías Ocultas del Catálogo'}
                    </h4>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {fotosAfectadas.length > 0
                        ? `Se detectaron infracciones o inconsistencias en: Foto ${fotosAfectadas.join(', Foto ')}.`
                        : 'Se requiere revisión de las fotografías antes de que la propiedad pueda ser publicada.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setAlertaFotosExpandida(!alertaFotosExpandida)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white/80 dark:bg-slate-900/80 border shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:bg-white dark:hover:bg-slate-900"
                  >
                    <span>{alertaFotosExpandida ? 'Ocultar Detalle' : 'Ver Detalle de Observación'}</span>
                    {alertaFotosExpandida ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Contenido Colapsable con el Motivo Completo del Correo */}
              {alertaFotosExpandida && (
                <div className="mt-3 pt-3 border-t border-current/20 space-y-2 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-current/15 text-xs space-y-1.5">
                    <span className="font-bold text-[10px] uppercase tracking-wider block opacity-75">
                      Motivo Oficial de Auditoría (enviado por correo electrónico):
                    </span>
                    <p className="italic leading-relaxed font-sans text-slate-800 dark:text-slate-200">
                      "{motivoModeracion || 'Se detectaron fotografías que no cumplen con las directrices comunitarias.'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-medium opacity-90 pt-1">
                    <span>💡 <strong>Acción requerida:</strong> Elimina las fotos señaladas usando el icono de papelera sobre cada una, añade fotos de reemplazo y pulsa <strong>"Guardar Cambios"</strong> para que la IA vuelva a auditar tu propiedad.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input oculto para subir archivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleArchivosLocalesHotel}
          />

          {/* Formulario para añadir foto por Archivo o URL */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendoFotoHotel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {subiendoFotoHotel ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Subiendo foto...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subir desde mi PC</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400 font-medium">o bien:</span>

            <input
              type="url"
              placeholder="Pega la URL de una nueva fotografía (https://...)"
              value={nuevaFotoHotelUrl}
              onChange={e => setNuevaFotoHotelUrl(e.target.value)}
              className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={agregarFotoHotel}
              disabled={!nuevaFotoHotelUrl.trim()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir por URL</span>
            </button>
          </div>

          {/* Cuadrícula de fotos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {draft.fotografias.map((foto, index) => {
              const esPrincipal = foto.esPrincipal || index === 0;
              const numFoto = index + 1;
              const esFotoAfectada = (estModeracion === 'RECHAZADO' || estModeracion === 'OBSERVADO' || estModeracion === 'SUSPENDIDO') &&
                (fotosAfectadas.includes(numFoto) || (fotosAfectadas.length === 0 && (estModeracion === 'RECHAZADO' || estModeracion === 'OBSERVADO')));

              return (
                <div
                  key={foto.idFotografia || index}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                    esFotoAfectada
                      ? estModeracion === 'RECHAZADO'
                        ? 'border-rose-600 ring-2 ring-rose-500 shadow-lg shadow-rose-500/25'
                        : 'border-amber-600 ring-2 ring-amber-500 shadow-lg shadow-amber-500/25'
                      : esPrincipal
                      ? 'border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <img
                    src={foto.url}
                    alt={foto.descripcion || `Foto ${index + 1}`}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Insignia o Botón "Poner como Principal" */}
                  <div className="absolute top-2.5 left-2.5">
                    {esPrincipal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Portada Principal</span>
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

                  {/* Insignia de Foto con Infracción / Observación */}
                  {esFotoAfectada && (
                    <div className="absolute top-2.5 right-11">
                      <span className={`px-2 py-1 rounded-full text-white font-bold text-[10px] shadow-md flex items-center gap-1 ${
                        estModeracion === 'RECHAZADO' ? 'bg-rose-600' : 'bg-amber-600'
                      }`}>
                        <AlertOctagon className="w-3 h-3" />
                        <span>Foto {numFoto} Infracción</span>
                      </span>
                    </div>
                  )}

                  {/* Botón Eliminar Foto */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => eliminarFotoHotel(index)}
                      className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm cursor-pointer"
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

      {/* PESTAÑA 3: HABITACIONES DEL HOTEL */}
      {tabActual === 'HABITACIONES' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Habitaciones &amp; Suites del Hotel ({draft.unidades?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cada habitación dispone de su propia pantalla para personalizar fotos individuales, tarifas en BOB y comodidades.
              </p>
            </div>

            <button
              type="button"
              onClick={agregarHabitacion}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Habitación</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(draft.unidades || []).map(u => {
              const fotoPortada = (u.fotografias || []).find(f => f.esPrincipal)?.url || (u.fotos && u.fotos[0]) || (u.fotografias && u.fotografias[0]?.url) || draft.fotografias[0]?.url;
              const cantidadFotos = (u.fotos?.length || u.fotografias?.length || 0);

              return (
                <div
                  key={u.idUnidad}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-400 transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={fotoPortada}
                      alt={u.nombre}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {u.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {u.descripcion || 'Sin descripción detallada'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap pt-0.5">
                        <span>👥 {u.capacidadPersonas} huéspedes</span>
                        <span>•</span>
                        <span>🛏️ {u.cantidadCamas} camas</span>
                        <span>•</span>
                        <span>🚿 {u.cantidadBanios || u.cantidadBanos || 1} baños</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          Bs. {u.precioNoche} / noche
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({cantidadFotos} fotos propias)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => cambiarHabitacion(u.idUnidad)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      <DoorOpen className="w-4 h-4" />
                      <span>Ingresar a esta Habitación</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarHabitacion(u.idUnidad)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Eliminar Habitación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: RESEÑAS Y VALORACIONES */}
      {tabActual === 'RESENAS' && (() => {
        const resenasFiltradas = resenas.filter(r => {
          if (filtroUnidadResena === 'TODAS') return true;
          if (filtroUnidadResena === 'HOTEL') return !r.idUnidad;
          return r.idUnidad === filtroUnidadResena;
        });

        // Cálculo dinámico y verídico de métricas para la selección actual
        const metricas = calcularMetricasReales(resenasFiltradas);
        const unidadSel = (draft.unidades || []).find(u => u.idUnidad === filtroUnidadResena);
        const tituloSeccion = filtroUnidadResena === 'TODAS'
          ? 'Opiniones de los Huéspedes'
          : filtroUnidadResena === 'HOTEL'
          ? 'Opiniones del Hotel en General'
          : `Opiniones para: ${unidadSel?.nombre || 'Habitación'}`;

        return (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs animate-fade-in">
            {/* Header de Reseñas con Métricas Reales Dinámicas */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-900/80 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  {metricas.promedioGeneral !== null ? (
                    <>
                      <span className="font-mono text-2xl font-black leading-none">
                        {metricas.promedioGeneral.toFixed(1)}
                      </span>
                      <span className="text-[10px] opacity-80 font-medium">de 5.0</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-2xl font-black leading-none text-blue-200">—</span>
                      <span className="text-[9px] opacity-80 font-medium">Sin reseñas</span>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    {tituloSeccion}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {metricas.total === 0
                      ? '0 reseñas registradas para esta selección'
                      : `${metricas.total} ${metricas.total === 1 ? 'reseña verificada' : 'reseñas verificadas de estancias reales'}`}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                    {[1, 2, 3, 4, 5].map(star => {
                      const activa = metricas.promedioGeneral !== null && star <= Math.round(metricas.promedioGeneral);
                      return (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            activa ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pilares de Valoración Oficiales Calculados de Forma Real */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Limpieza</span>
                  <strong className={`text-xs font-mono font-bold ${metricas.promedioLimpieza !== null ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    {metricas.promedioLimpieza !== null ? `${metricas.promedioLimpieza}★` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Ubicación</span>
                  <strong className={`text-xs font-mono font-bold ${metricas.promedioUbicacion !== null ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    {metricas.promedioUbicacion !== null ? `${metricas.promedioUbicacion}★` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Calidad/Precio</span>
                  <strong className={`text-xs font-mono font-bold ${metricas.promedioCalidadPrecio !== null ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    {metricas.promedioCalidadPrecio !== null ? `${metricas.promedioCalidadPrecio}★` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Servicio</span>
                  <strong className={`text-xs font-mono font-bold ${metricas.promedioServicio !== null ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    {metricas.promedioServicio !== null ? `${metricas.promedioServicio}★` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Comodidad</span>
                  <strong className={`text-xs font-mono font-bold ${metricas.promedioComodidad !== null ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                    {metricas.promedioComodidad !== null ? `${metricas.promedioComodidad}★` : '—'}
                  </strong>
                </div>
              </div>
            </div>

          {/* Filtro por Habitación (si es un hotel) */}
          {esHotel && (draft.unidades?.length || 0) > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filtrar por:</span>
                <select
                  value={filtroUnidadResena}
                  onChange={e => setFiltroUnidadResena(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las reseñas ({resenas.length})</option>
                  <option value="HOTEL">Hotel en general</option>
                  {(draft.unidades || []).map(u => (
                    <option key={u.idUnidad} value={u.idUnidad}>
                      Habitación: {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={cargarResenas}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition cursor-pointer"
              >
                ↻ Actualizar
              </button>
            </div>
          )}

          {/* Lista de Reseñas Reales */}
          {(() => {
            const resenasFiltradas = resenas.filter(r => {
              if (filtroUnidadResena === 'TODAS') return true;
              if (filtroUnidadResena === 'HOTEL') return !r.idUnidad;
              return r.idUnidad === filtroUnidadResena;
            });

            if (cargandoResenas) {
              return (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Cargando reseñas oficiales...</span>
                </div>
              );
            }

            if (resenasFiltradas.length === 0) {
              return (
                <div className="py-14 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Aún no hay reseñas registradas
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Las calificaciones y comentarios de los viajeros aparecerán aquí en tiempo real cuando completen sus reservas.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {resenasFiltradas.map((r, i) => {
                  const unidadRel = (draft.unidades || []).find(u => u.idUnidad === r.idUnidad);
                  const nombreUnidad = r.nombreUnidad || unidadRel?.nombre;
                  const sent = String(r.sentimientoNlp || '').toUpperCase();

                  return (
                    <div
                      key={r.idValoracion || i}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {r.nombreUsuario ? r.nombreUsuario.charAt(0).toUpperCase() : 'H'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {r.nombreUsuario || 'Huésped Verificado'}
                            </span>
                            {nombreUnidad && (
                              <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800">
                                {nombreUnidad}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Badge Sentimiento NLP */}
                          {sent === 'POSITIVO' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              ✓ Experiencia Positiva
                            </span>
                          ) : sent === 'NEGATIVO' ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                              ⚠️ Requiere Atención
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                              Neutral
                            </span>
                          )}

                          {/* Estrellas */}
                          <div className="flex items-center gap-1 font-mono font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{r.puntuacionGeneral}.0</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
                        "{r.comentario}"
                      </p>

                      {r.fechaCreacion && (
                        <div className="text-[10px] text-slate-400 pt-1">
                          {new Date(r.fechaCreacion).toLocaleDateString('es-BO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ); })()}

    </div>
  );
};
