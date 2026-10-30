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
      <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold shrink-0">
        <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                ? 'pill-active scale-105 ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {dep}
          </button>
        );
      })}
    </div>
  );
};
