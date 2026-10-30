import React from 'react';
import { Alojamiento } from '../types/catalogo.types';
import { AlojamientoCard } from './AlojamientoCard';
import { Home } from 'lucide-react';

interface AlojamientoGridProps {
  alojamientos: Alojamiento[];
  loading: boolean;
  onSelect: (alojamiento: Alojamiento) => void;
  onReservarDirecto: (alojamiento: Alojamiento) => void;
}

export const AlojamientoGrid: React.FC<AlojamientoGridProps> = ({
  alojamientos,
  loading,
  onSelect,
  onReservarDirecto,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 space-y-4 animate-pulse">
            <div className="aspect-[4/3] bg-stone-200 dark:bg-stone-800 rounded-2xl" />
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-2/3" />
            <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
            <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (alojamientos.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <Home className="w-12 h-12 text-stone-400 mx-auto mb-3" />
        <h4 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mb-1">
          No se encontraron propiedades en esta región
        </h4>
        <p className="text-xs text-stone-500">
          Intenta seleccionando "Todos" para ver todas las opciones disponibles en Bolivia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {alojamientos.map((alojamiento) => (
        <AlojamientoCard
          key={alojamiento.idAlojamiento}
          alojamiento={alojamiento}
          onSelect={onSelect}
          onReservarDirecto={onReservarDirecto}
        />
      ))}
    </div>
  );
};
