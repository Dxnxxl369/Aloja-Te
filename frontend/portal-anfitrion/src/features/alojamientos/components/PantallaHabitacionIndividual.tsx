import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Star,
  Trash2,
  Plus,
  ImagePlus,
  Users,
  BedDouble,
  Bath,
  DollarSign,
  UploadCloud,
  Loader2,
  Edit3,
  AlertTriangle,
  AlertOctagon,
  Ban,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { UnidadReservable, Fotografia, Valoracion } from '../../../core/types/anfitrion.types';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';

interface PantallaHabitacionIndividualProps {
  habitacion: UnidadReservable;
  hotelTitulo: string;
  alojamientoId?: string;
  motivoObservacion?: string;
  estadoAlojamiento?: string;
  onVolver: () => void;
  onGuardarHabitacion: (actualizada: UnidadReservable) => void;
}

export const PantallaHabitacionIndividual: React.FC<PantallaHabitacionIndividualProps> = ({
  habitacion,
  hotelTitulo,
  alojamientoId,
  motivoObservacion,
  estadoAlojamiento,
  onVolver,
  onGuardarHabitacion
}) => {
  const [draft, setDraft] = useState<UnidadReservable>(() => JSON.parse(JSON.stringify(habitacion)));
  const [tabActual, setTabActual] = useState<'DATOS' | 'FOTOS' | 'RESENAS'>('DATOS');
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [alertaFotosExpandida, setAlertaFotosExpandida] = useState(false);
  const habFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Reseñas de esta habitación
  const [resenasHab, setResenasHab] = useState<Valoracion[]>([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  const estModeracion = estadoAlojamiento || draft.estado || 'PUBLICADO';
  const motivo = motivoObservacion || '';

  // Fotos afectadas en esta habitación si el motivo la menciona
  const fotosAfectadas = useMemo(() => {
    if (!motivo) return [];
    const nombreNormal = (draft.nombre || '').toLowerCase();
    const motivoNormal = motivo.toLowerCase();
    const aplicaEstaHabitacion = motivoNormal.includes(nombreNormal) || motivoNormal.includes('habitación') || motivoNormal.includes('habitacion');
    if (!aplicaEstaHabitacion && !motivoNormal.includes('galería') && !motivoNormal.includes('galeria')) {
      return [];
    }
    const matches = motivo.matchAll(/foto\s+(\d+)/gi);
    const indices: number[] = [];
    for (const m of matches) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num)) indices.push(num);
    }
    return Array.from(new Set(indices));
  }, [motivo, draft.nombre]);

  const cargarResenas = useCallback(async () => {
    if (!draft.idUnidad) return;
    setCargandoResenas(true);
    try {
      const urls = [
        alojamientoId ? `${API_BASE_URL}/api/v1/alojamientos/${alojamientoId}/unidades/${draft.idUnidad}/valoraciones` : null,
        `${API_BASE_URL}/api/v1/unidades/${draft.idUnidad}/valoraciones`
      ].filter(Boolean) as string[];

      for (const url of urls) {
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) {
              setResenasHab(data);
              return;
            }
          }
        } catch {}
      }
    } finally {
      setCargandoResenas(false);
    }
  }, [alojamientoId, draft.idUnidad]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  const handleArchivosLocales = async (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    setSubiendoFoto(true);
    for (const file of Array.from(archivos)) {
      try {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('file', file);
        let res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=habitaciones`, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=habitaciones`, {
            method: 'POST',
            body: formData
          });
        }
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setDraft(prev => {
              const actuales = prev.fotos && prev.fotos.length > 0 ? prev.fotos : (prev.fotografias || []).map(f => f.url);
              const nuevas = [...actuales, data.url];
              const fotosObj: Fotografia[] = nuevas.map((url, i) => ({
                idFotografia: `fhab-${prev.idUnidad}-${i}`,
                url,
                esPrincipal: i === 0,
                orden: i
              }));
              return {
                ...prev,
                fotos: nuevas,
                fotografias: fotosObj
              };
            });
            continue;
          }
        }
      } catch (err) {
        console.warn('Error al subir foto de habitación a la nube:', err);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setDraft(prev => {
            const actuales = prev.fotos && prev.fotos.length > 0 ? prev.fotos : (prev.fotografias || []).map(f => f.url);
            const nuevas = [...actuales, dataUrl];
            const fotosObj: Fotografia[] = nuevas.map((url, i) => ({
              idFotografia: `fhab-${prev.idUnidad}-${i}`,
              url,
              esPrincipal: i === 0,
              orden: i
            }));
            return {
              ...prev,
              fotos: nuevas,
              fotografias: fotosObj
            };
          });
        }
      };
      reader.readAsDataURL(file);
    }
    setSubiendoFoto(false);
  };

  const getFotos = (): string[] => {
    if (draft.fotos && draft.fotos.length > 0) return draft.fotos;
    if (draft.fotografias && draft.fotografias.length > 0) return draft.fotografias.map(f => f.url);
    return [];
  };

  const fotos = getFotos();

  const marcarFotoPrincipal = (index: number) => {
    if (!fotos[index]) return;
    const seleccionada = fotos[index];
    const restantes = fotos.filter((_, i) => i !== index);
    const reordenadas = [seleccionada, ...restantes];

    const fotosObj: Fotografia[] = reordenadas.map((url, i) => ({
      idFotografia: `fhab-${draft.idUnidad}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      fotos: reordenadas,
      fotografias: fotosObj
    }));
  };

  const eliminarFoto = (index: number) => {
    if (fotos.length <= 1) {
      alert('La habitación debe tener al menos una fotografía de portada.');
      return;
    }
    const reordenadas = fotos.filter((_, i) => i !== index);
    const fotosObj: Fotografia[] = reordenadas.map((url, i) => ({
      idFotografia: `fhab-${draft.idUnidad}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      fotos: reordenadas,
      fotografias: fotosObj
    }));
  };

  const agregarFoto = () => {
    if (!nuevaFotoUrl.trim()) return;
    const reordenadas = [...fotos, nuevaFotoUrl.trim()];
    const fotosObj: Fotografia[] = reordenadas.map((url, i) => ({
      idFotografia: `fhab-${draft.idUnidad}-${i}`,
      url,
      esPrincipal: i === 0,
      orden: i
    }));

    setDraft(prev => ({
      ...prev,
      fotos: reordenadas,
      fotografias: fotosObj
    }));
    setNuevaFotoUrl('');
  };

  const guardar = () => {
    onGuardarHabitacion(draft);
  };

  // Cálculo de promedio real de la habitación (null si no existen reseñas)
  const promedioHab = useMemo(() => {
    if (!resenasHab || resenasHab.length === 0) return null;
    const suma = resenasHab.reduce((acc, r) => acc + Number(r.puntuacionGeneral || 0), 0);
    return Number((suma / resenasHab.length).toFixed(1));
  }, [resenasHab]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Barra de Navegación y Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolver}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-2 text-xs font-bold shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Volver a Habitaciones del Hotel</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                Hotel: {hotelTitulo}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                Pantalla Individual de Habitación
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {draft.nombre}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={guardar}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Guardar Cambios de la Habitación</span>
        </button>
      </div>

      {/* Pestañas de Navegación de la Habitación (Reutiliza la estructura limpia del Hotel) */}
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
          <span>Información de la Habitación</span>
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
          <span>Fotos de la Habitación ({fotos.length})</span>
        </button>

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
          <span>Reseñas de la Habitación {resenasHab.length > 0 ? `(${resenasHab.length})` : ''}</span>
        </button>
      </div>

      {/* PESTAÑA 1: DATOS Y ESPECIFICACIONES DE LA HABITACIÓN */}
      {tabActual === 'DATOS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 text-xs animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Comercial de la Habitación / Suite
              </label>
              <input
                type="text"
                value={draft.nombre}
                onChange={e => setDraft(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
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
                  value={draft.precioNoche}
                  onChange={e => setDraft(prev => ({ ...prev, precioNoche: Number(e.target.value) }))}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                👥 Capacidad Máxima Huéspedes
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={draft.capacidadPersonas}
                onChange={e => setDraft(prev => ({ ...prev, capacidadPersonas: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                🛏️ Cantidad de Camas
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={draft.cantidadCamas}
                onChange={e => setDraft(prev => ({ ...prev, cantidadCamas: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                🚿 Cantidad de Baños
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={draft.cantidadBanios || draft.cantidadBanos || 1}
                onChange={e => {
                  const val = Number(e.target.value);
                  setDraft(prev => ({ ...prev, cantidadBanios: val, cantidadBanos: val }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descripción Exclusiva de esta Habitación
            </label>
            <textarea
              rows={4}
              value={draft.descripcion || ''}
              onChange={e => setDraft(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Detalla las características (cama King, vista al jardín, jacuzzi, balcón privado, etc.)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* PESTAÑA 2: FOTOS DE LA HABITACIÓN */}
      {tabActual === 'FOTOS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in text-xs">
          {/* Banner de Auditoría Visual en Fotos (Solo si está OBSERVADO, RECHAZADO o SUSPENDIDO) */}
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
                        : 'Habitación Suspendida - Fotografías Ocultas del Catálogo'}
                    </h4>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {fotosAfectadas.length > 0
                        ? `Se detectaron inconsistencias en esta habitación: Foto ${fotosAfectadas.join(', Foto ')}.`
                        : 'Revisa las fotos de esta habitación para cumplir con las directrices comunitarias.'}
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

              {/* Contenido Colapsable */}
              {alertaFotosExpandida && (
                <div className="mt-3 pt-3 border-t border-current/20 space-y-2 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-current/15 text-xs space-y-1.5">
                    <span className="font-bold text-[10px] uppercase tracking-wider block opacity-75">
                      Mensaje Oficial recibido por Correo Electrónico:
                    </span>
                    <p className="italic leading-relaxed font-sans text-slate-800 dark:text-slate-200">
                      "{motivo || 'Fotografías requieren corrección antes de ser publicadas.'}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium opacity-90 pt-1">
                    <span>💡 Elimina las fotos infractoras con el botón de papelera y guarda los cambios para re-auditar.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulario para añadir nueva foto a la habitación */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              ref={habFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleArchivosLocales(e.target.files)}
            />

            <button
              type="button"
              onClick={() => habFileInputRef.current?.click()}
              disabled={subiendoFoto}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {subiendoFoto ? (
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
              placeholder="Pega la URL de una foto de esta habitación (https://...)"
              value={nuevaFotoUrl}
              onChange={e => setNuevaFotoUrl(e.target.value)}
              className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={agregarFoto}
              disabled={!nuevaFotoUrl.trim()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir por URL</span>
            </button>
          </div>

          {/* Cuadrícula de fotos de la habitación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fotos.map((url, index) => {
              const esPrincipal = index === 0;
              const numFoto = index + 1;
              const esFotoAfectada = (estModeracion === 'RECHAZADO' || estModeracion === 'OBSERVADO' || estModeracion === 'SUSPENDIDO') &&
                (fotosAfectadas.includes(numFoto) || (fotosAfectadas.length === 0 && (estModeracion === 'RECHAZADO' || estModeracion === 'OBSERVADO')));

              return (
                <div
                  key={`${url}-${index}`}
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
                    src={url}
                    alt={`Foto ${numFoto}`}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Insignia / Botón Poner como Principal */}
                  <div className="absolute top-2.5 left-2.5">
                    {esPrincipal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Portada de Habitación</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => marcarFotoPrincipal(index)}
                        className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-blue-600 text-white text-[10px] font-bold backdrop-blur-sm transition flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        <span>Poner como Principal</span>
                      </button>
                    )}
                  </div>

                  {/* Insignia de Infracción si aplica */}
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
                      onClick={() => eliminarFoto(index)}
                      className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm cursor-pointer"
                      title="Eliminar Fotografía"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="truncate">{draft.nombre}</span>
                    <span className="font-mono text-[10px]">Pos: {numFoto}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: RESEÑAS DE ESTA HABITACIÓN */}
      {tabActual === 'RESENAS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-xs animate-fade-in">
          {/* Header de Reseñas de la Habitación con Promedio Real */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-900/80 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                {promedioHab !== null ? (
                  <>
                    <span className="font-mono text-xl font-black leading-none">
                      {promedioHab.toFixed(1)}
                    </span>
                    <span className="text-[9px] opacity-80 font-medium">de 5.0</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-xl font-black leading-none text-blue-200">—</span>
                    <span className="text-[8px] opacity-80 font-medium text-center">Sin reseñas</span>
                  </>
                )}
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Opiniones para: {draft.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {resenasHab.length === 0
                    ? '0 reseñas registradas para esta suite'
                    : `${resenasHab.length} ${resenasHab.length === 1 ? 'reseña registrada' : 'reseñas registradas para esta suite'}`}
                </p>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  {[1, 2, 3, 4, 5].map(star => {
                    const activa = promedioHab !== null && star <= Math.round(promedioHab);
                    return (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          activa ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={cargarResenas}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer self-start sm:self-auto"
            >
              ↻ Actualizar Reseñas
            </button>
          </div>

          {/* Listado de Reseñas de la Habitación */}
          {cargandoResenas ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Cargando opiniones de esta suite...</span>
            </div>
          ) : resenasHab.length === 0 ? (
            <div className="py-14 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Esta habitación aún no tiene reseñas registradas
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Los comentarios y calificaciones de los huéspedes que reserven y se alojen en esta suite aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resenasHab.map((r, i) => {
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
                        <span className="font-bold text-slate-900 dark:text-white">
                          {r.nombreUsuario || 'Huésped Verificado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
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
          )}
        </div>
      )}

    </div>
  );
};
