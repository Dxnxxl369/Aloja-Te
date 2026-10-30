import React from 'react';
import { Compass } from 'lucide-react';

interface FiltrosDepartamentosProps {
  departamentoSeleccionado: string;
  onSelect: (dep: string) => void;
}

const DEPARTAMENTOS = [
  'Todos',
  'Santa Cruz',
  'La Paz',
  'Cochabamba',
  'Tarija',
  'Chuquisaca',
  'Beni',
  'Potosí',
  'Oruro',
  'Pando'
];

export const FiltrosDepartamentos: React.FC<FiltrosDepartamentosProps> = ({
  departamentoSeleccionado,
  onSelect,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200/60 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 text-xs font-semibold shrink-0">
        <Compass className="w-3.5 h-3.5" />
        <span>Filtro:</span>
      </div>

      {DEPARTAMENTOS.map((dep) => {
        const isSelected = departamentoSeleccionado === dep;
        return (
          <button
            key={dep}
            onClick={() => onSelect(dep)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm ${
              isSelected
                ? 'bg-brand-600 text-white shadow-brand-600/30 scale-105'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-brand-400 dark:hover:border-brand-500'
            }`}
          >
            {dep}
          </button>
        );
      })}
    </div>
  );
};
