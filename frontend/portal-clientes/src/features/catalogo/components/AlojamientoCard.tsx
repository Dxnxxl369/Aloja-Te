import React from 'react';
import { Alojamiento } from '../types/catalogo.types';
import { Star, MapPin, Users, ArrowRight } from 'lucide-react';

interface AlojamientoCardProps {
  alojamiento: Alojamiento;
  onSelect: (alojamiento: Alojamiento) => void;
  onReservarDirecto: (alojamiento: Alojamiento) => void;
}

export const AlojamientoCard: React.FC<AlojamientoCardProps> = ({
  alojamiento,
  onSelect,
  onReservarDirecto,
}) => {
  const fotoPrincipal = alojamiento.fotografias?.find(f => f.esPrincipal)?.url ||
    alojamiento.fotografias?.[0]?.url ||
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';

  const calificacion = typeof alojamiento.calificacionPromedio === 'number'
    ? alojamiento.calificacionPromedio.toFixed(2)
    : '4.95';

  const resenas = alojamiento.totalResenas ?? 24;
  const precio = alojamiento.precioBaseNoche ?? alojamiento.unidades?.[0]?.precioNoche ?? 650;
  const moneda = alojamiento.moneda || 'BOB';
  const tipoProp = (alojamiento.tipoPropiedad || 'Alojamiento').replace('_', ' ');
  const capacidad = alojamiento.unidades?.[0]?.capacidadPersonas || 4;

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between">
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onSelect(alojamiento)}>
        <img
          src={fotoPrincipal}
          alt={alojamiento.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>{calificacion}</span>
          <span className="text-[10px] text-slate-300 font-normal">({resenas})</span>
        </div>

        {/* Department Pill */}
        <div className="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full bg-blue-950/85 backdrop-blur-md border border-blue-500/30 text-blue-200 text-[11px] font-bold flex items-center gap-1 shadow-md">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span>{alojamiento.ciudad}, {alojamiento.departamento}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-2 font-semibold uppercase tracking-wider">
            <span>{tipoProp}</span>
            {alojamiento.modalidad === 'HOTEL_HOSTAL' ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                🏨 Hotel / Hostal
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                🏡 Casa / Depto Entero
              </span>
            )}
          </div>

          <h3
            onClick={() => onSelect(alojamiento)}
            className="font-serif text-xl font-bold text-stone-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition cursor-pointer"
          >
            {alojamiento.titulo}
          </h3>

          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {alojamiento.descripcion}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa por Noche</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {precio}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {moneda}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(alojamiento)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Ver Pantalla
            </button>
            <button
              onClick={() => onReservarDirecto(alojamiento)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
            >
              <span>Reservar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
