import React, { useState } from 'react';
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
  CalendarCheck
} from 'lucide-react';
import { Alojamiento, UnidadReservable, Fotografia } from '../../../core/types/anfitrion.types';
import { PantallaHabitacionIndividual } from './PantallaHabitacionIndividual';

interface EditorHotelPantallaProps {
  alojamiento: Alojamiento;
  onVolver: () => void;
  onGuardarHotel: (actualizado: Alojamiento) => void;
  habitacionEnPantallaIdInicial?: string | null;
  onCambiarHabitacion?: (idHabitacion: string | null) => void;
}

export const EditorHotelPantalla: React.FC<EditorHotelPantallaProps> = ({
  alojamiento,
  onVolver,
  onGuardarHotel,
  habitacionEnPantallaIdInicial,
  onCambiarHabitacion
}) => {
  const [draft, setDraft] = useState<Alojamiento>(() => JSON.parse(JSON.stringify(alojamiento)));
  const [tabActual, setTabActual] = useState<'DATOS' | 'FOTOS' | 'HABITACIONES'>('DATOS');
  
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
    setDraft(prev => ({
      ...prev,
      unidades: prev.unidades.map(u => u.idUnidad === actualizada.idUnidad ? actualizada : u)
    }));
    cambiarHabitacion(null);
  };

  const habitacionActiva = draft.unidades?.find(u => u.idUnidad === habitacionEnPantallaId) || null;

  // Si el usuario está dentro de la pantalla individual de una habitación:
  if (habitacionEnPantallaId && habitacionActiva) {
    return (
      <PantallaHabitacionIndividual
        habitacion={habitacionActiva}
        hotelTitulo={draft.titulo}
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
                  onClick={() => {
                    const actualizado: Alojamiento = {
                      ...draft,
                      estado: 'PENDIENTE',
                      estadoPublicacion: 'PENDIENTE',
                      motivoObservacionRechazo: undefined
                    };
                    setDraft(actualizado);
                    onGuardarHotel(actualizado);
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

        if (est === 'PENDIENTE') {
          return (
            <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
              <div className="flex items-center gap-2 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                  🕒 Estado: En Cola de Auditoría
                </span>
                <span>Tu propiedad está siendo revisada por el equipo de moderación institucional.</span>
              </div>
            </div>
          );
        }

        if (est === 'PUBLICADO') {
          return (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                  ✅ Estado: Publicado en Catálogo
                </span>
                <span>Visible para millones de viajeros con reservas y cobros QR BNB habilitados.</span>
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
            <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-600 text-white text-[10px]">
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
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTabActual('DATOS')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
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
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            tabActual === 'FOTOS'
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
            onClick={() => setTabActual('HABITACIONES')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              tabActual === 'HABITACIONES'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Habitaciones del Hotel ({draft.unidades?.length || 0})</span>
          </button>
        )}
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

      {/* PESTAÑA 2: FOTOGRAFÍAS DEL HOTEL */}
      {tabActual === 'FOTOS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <div>
              <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300">
                Fotografía Principal de Portada
              </h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Haz clic en <strong>"Poner como Principal"</strong> sobre cualquier imagen para que se muestre como portada del hotel.
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 self-start sm:self-auto shadow-sm">
              {draft.fotografias.length} Fotografías registradas
            </span>
          </div>

          {/* Formulario para añadir foto por URL */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              placeholder="Pega la URL de una nueva fotografía del hotel (https://...)"
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
              <span>Añadir Fotografía</span>
            </button>
          </div>

          {/* Cuadrícula de fotos */}
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
              <span>+ Añadir Habitación</span>
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

    </div>
  );
};
