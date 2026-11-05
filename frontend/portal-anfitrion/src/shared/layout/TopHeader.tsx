import React from 'react';
import { Menu, KeyRound, Plus } from 'lucide-react';

interface TopHeaderProps {
  titulo: string;
  subtitulo: string;
  onAbrirMenuMovil: () => void;
  onAbrirValidarPin: () => void;
  onPublicarPropiedad: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  titulo,
  subtitulo,
  onAbrirMenuMovil,
  onAbrirValidarPin,
  onPublicarPropiedad
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onAbrirMenuMovil}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
            {titulo}
          </h2>
          <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
            {subtitulo}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onAbrirValidarPin}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span>Ingresar PIN de Huésped</span>
        </button>

        <button
          type="button"
          onClick={onPublicarPropiedad}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publicar Propiedad</span>
          <span className="sm:hidden">Publicar</span>
        </button>
      </div>
    </header>
  );
};
