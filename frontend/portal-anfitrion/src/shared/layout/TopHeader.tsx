import React from 'react';
import { Menu } from 'lucide-react';

interface TopHeaderProps {
  titulo: string;
  subtitulo?: string;
  onAbrirMenuMovil: () => void;
  accionDerecha?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  titulo,
  onAbrirMenuMovil,
  accionDerecha
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-14 px-4 sm:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onAbrirMenuMovil}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb limpio de 1 línea */}
        <div className="text-xs text-slate-400 truncate">
          <span>Anfitrión</span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {titulo}
          </span>
        </div>
      </div>

      {accionDerecha && (
        <div className="flex items-center gap-2">
          {accionDerecha}
        </div>
      )}
    </header>
  );
};