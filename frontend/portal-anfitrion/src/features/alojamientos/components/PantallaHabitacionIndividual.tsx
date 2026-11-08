import React, { useState } from 'react';
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
  UploadCloud
} from 'lucide-react';
import { UnidadReservable, Fotografia } from '../../../core/types/anfitrion.types';

interface PantallaHabitacionIndividualProps {
  habitacion: UnidadReservable;
  hotelTitulo: string;
  onVolver: () => void;
  onGuardarHabitacion: (actualizada: UnidadReservable) => void;
}

export const PantallaHabitacionIndividual: React.FC<PantallaHabitacionIndividualProps> = ({
  habitacion,
  hotelTitulo,
  onVolver,
  onGuardarHabitacion
}) => {
  const [draft, setDraft] = useState<UnidadReservable>(() => JSON.parse(JSON.stringify(habitacion)));
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const habFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleArchivosLocales = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    const filesArray = Array.from(archivos);
    filesArray.forEach((file) => {
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
    });
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Barra de Navegación y Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolver}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-2 text-xs font-bold shadow-sm"
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
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Guardar Cambios de la Habitación</span>
        </button>
      </div>

      {/* Contenido de la Habitación en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Parámetros y Tarifas de la Habitación */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Especificaciones de la Suite
          </h3>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Comercial de la Habitación
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

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Huéspedes
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={draft.capacidadPersonas}
                onChange={e => setDraft(prev => ({ ...prev, capacidadPersonas: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Camas
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={draft.cantidadCamas}
                onChange={e => setDraft(prev => ({ ...prev, cantidadCamas: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Baños
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-center"
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
              placeholder="Detalla las características (cama King, vista al jardín, jacuzzi, etc.)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Columna Derecha: Galería Fotográfica Individual de esta Habitación */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-blue-600" />
                <span>Fotografías Propias de esta Habitación ({fotos.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona cuál imagen se mostrará como <strong>Portada Principal de la Habitación</strong>.
              </p>
            </div>
          </div>

          {/* Formulario para añadir nueva foto a la habitación */}
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
                    handleArchivosLocales(e.target.files);
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
                placeholder="O pega la URL web de una nueva fotografía (ej. https://...)"
                value={nuevaFotoUrl}
                onChange={e => setNuevaFotoUrl(e.target.value)}
                className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={agregarFoto}
                disabled={!nuevaFotoUrl.trim()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir a Habitación</span>
              </button>
            </div>
          </div>

          {/* Cuadrícula de fotos con "Poner como Principal" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fotos.map((url, idx) => {
              const esPrincipal = idx === 0;

              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                    esPrincipal
                      ? 'border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Insignia o Botón "Poner como Principal" */}
                  <div className="absolute top-2.5 left-2.5">
                    {esPrincipal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Portada de Habitación</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => marcarFotoPrincipal(idx)}
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
                      onClick={() => eliminarFoto(idx)}
                      className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm"
                      title="Eliminar Fotografía"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>Posición: {idx + 1}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {esPrincipal ? 'Principal' : 'Secundaria'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
