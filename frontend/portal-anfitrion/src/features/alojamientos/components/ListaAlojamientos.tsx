import React, { useState } from 'react';
import {
  Plus,
  Sliders,
  Edit3,
  Eye,
  Calendar,
  Hotel,
  Home
} from 'lucide-react';
import { Alojamiento } from '../../../core/types/anfitrion.types';
import { EditorHotelPantalla } from './EditorHotelPantalla';

interface ListaAlojamientosProps {
  alojamientos: Alojamiento[];
  onGuardarLista: (nuevaLista: Alojamiento[]) => void;
  onPublicarNuevo: () => void;
}

export const ListaAlojamientos: React.FC<ListaAlojamientosProps> = ({
  alojamientos,
  onGuardarLista,
  onPublicarNuevo
}) => {
  const [alojamientoEnEdicionId, setAlojamientoEnEdicionId] = useState<string | null>(null);
  const [filtroDepto, setFiltroDepto] = useState('TODOS');
  const [filtroModalidad, setFiltroModalidad] = useState('TODOS');

  // Filtrado reactivo
  const filtrados = alojamientos.filter(a => {
    const cumpleDepto = filtroDepto === 'TODOS' || a.departamento === filtroDepto;
    const esHotel = a.modalidad === 'HOTEL_HOSTAL' || a.tipoPropiedad?.toUpperCase() === 'HOTEL';
    const cumpleModalidad =
      filtroModalidad === 'TODOS' ||
      (filtroModalidad === 'HOTEL' && esHotel) ||
      (filtroModalidad === 'CASA' && !esHotel);

    return cumpleDepto && cumpleModalidad;
  });

  const alojamientoActivoEdicion = alojamientos.find(a => a.idAlojamiento === alojamientoEnEdicionId) || null;

  const handleGuardarHotel = (actualizado: Alojamiento) => {
    const nuevaLista = alojamientos.map(a =>
      a.idAlojamiento === actualizado.idAlojamiento ? actualizado : a
    );
    onGuardarLista(nuevaLista);
    setAlojamientoEnEdicionId(null);
  };

  // Si está en pantalla completa de edición del hotel:
  if (alojamientoEnEdicionId && alojamientoActivoEdicion) {
    return (
      <EditorHotelPantalla
        alojamiento={alojamientoActivoEdicion}
        onVolver={() => setAlojamientoEnEdicionId(null)}
        onGuardarHotel={handleGuardarHotel}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Catálogo de Mis Alojamientos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administra hoteles con sus habitaciones independientes, ajusta tarifas en BOB y actualiza fotos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filtroDepto}
            onChange={e => setFiltroDepto(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="TODOS">Todos los Departamentos</option>
            <option value="Santa Cruz">Santa Cruz</option>
            <option value="Tarija">Tarija</option>
            <option value="La Paz">La Paz</option>
          </select>

          <select
            value={filtroModalidad}
            onChange={e => setFiltroModalidad(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="TODOS">Todas las Modalidades</option>
            <option value="HOTEL">Hoteles &amp; Hostales</option>
            <option value="CASA">Casas &amp; Cabañas</option>
          </select>

          <button
            type="button"
            onClick={onPublicarNuevo}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Alojamiento</span>
          </button>
        </div>
      </div>

      {/* Cuadrícula de tarjetas de alojamientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrados.map(a => {
          const esHotel = a.modalidad === 'HOTEL_HOSTAL' || a.tipoPropiedad?.toUpperCase() === 'HOTEL';
          let badgeEstado = '⚪ Libre (Disponible)';
          let badgeClase = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

          if (a.estadoOperativo === 'EN_USO') {
            badgeEstado = '🟢 En Uso (Hospedado)';
            badgeClase = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
          } else if (a.estadoOperativo === 'PENDIENTE') {
            badgeEstado = '🟡 Pendiente de PIN';
            badgeClase = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
          }

          return (
            <div
              key={a.idAlojamiento}
              className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:border-blue-400 transition group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={a.fotografias[0]?.url}
                  alt={a.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {esHotel ? '🏨 Hotel' : '🏡 Casa'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClase}`}>
                    {badgeEstado}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md font-mono text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                  Bs. {a.precioBaseNoche} / noche
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {a.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {a.ciudad}, {a.departamento} • {esHotel ? `${a.unidades?.length || 0} habitaciones` : 'Unidad entera'}
                  </p>
                </div>

                {/* Sucesión de reservas en cola */}
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Cadena de Huéspedes:
                  </span>
                  {a.reservas && a.reservas.length > 0 ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="truncate font-semibold">{a.reservas[0].huespedNombre}</span>
                        <span className="font-mono text-[10px] text-slate-500">{a.reservas[0].desde}</span>
                      </div>
                      {a.reservas.length > 1 && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          +{a.reservas.length - 1} reserva consecutiva programada
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Sin reservas pendientes inmediatas</span>
                  )}
                </div>

                {/* Botón de inspeccionar y editar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAlojamientoEnEdicionId(a.idAlojamiento)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{esHotel ? 'Administrar Hotel & Habitaciones' : 'Editar Alojamiento'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
