import React from 'react';
import {
  LayoutDashboard,
  Home,
  KeyRound,
  BadgeDollarSign,
  TrendingUp,
  Moon,
  Sun,
  ExternalLink,
  X
} from 'lucide-react';
import { useAnfitrionAuth } from '../../core/auth/AuthContext';

interface SidebarLateralProps {
  seccionActiva: string;
  onCambiarSeccion: (seccion: string) => void;
  conteoPendientes: number;
  conteoAlojamientos: number;
  menuMovilAbierto: boolean;
  onCerrarMenuMovil: () => void;
}

export const SidebarLateral: React.FC<SidebarLateralProps> = ({
  seccionActiva,
  onCambiarSeccion,
  conteoPendientes,
  conteoAlojamientos,
  menuMovilAbierto,
  onCerrarMenuMovil
}) => {
  const { perfil, anfitrionClave, cambiarPerfil, darkMode, toggleDarkMode } = useAnfitrionAuth();

  return (
    <>
      {/* Overlay para móvil */}
      {menuMovilAbierto && (
        <div
          onClick={onCerrarMenuMovil}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar fijo a la izquierda */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 shadow-xl lg:shadow-none ${
          menuMovilAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Marca y encabezado */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Aloja-Te
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                  Anfitrión
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Gestión Hotelera &amp; Residencial</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrarMenuMovil}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta de Anfitrión Verificado */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-serif text-lg font-bold flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {perfil.nombre.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {perfil.nombre}
                </h4>
                {/* Insignia Azul de Verificado */}
                <span className="inline-flex items-center text-blue-600 dark:text-blue-400 shrink-0" title="Anfitrión Oficialmente Acreditado">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-4-4 1.41-1.41L10.8 13.38l6.79-6.79 1.41 1.41-8.2 8.2z" />
                  </svg>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {perfil.ciudad} • {conteoAlojamientos} Alojamientos
              </p>
            </div>
          </div>

          {/* Conmutador de Anfitrión Demostrativo (Carlos vs Elena) */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Cambiar Anfitrión:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => cambiarPerfil('carlos')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                  anfitrionClave === 'carlos'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Carlos
              </button>
              <button
                type="button"
                onClick={() => cambiarPerfil('elena')}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                  anfitrionClave === 'elena'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Elena
              </button>
            </div>
          </div>
        </div>

        {/* Menú de navegación principal */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Gestión Operativa
          </p>

          <button
            type="button"
            onClick={() => onCambiarSeccion('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              seccionActiva === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tablero de Control</span>
          </button>

          <button
            type="button"
            onClick={() => onCambiarSeccion('alojamientos')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              seccionActiva === 'alojamientos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4" />
              <span>Mis Alojamientos</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              {conteoAlojamientos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onCambiarSeccion('recepcion')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              seccionActiva === 'recepcion'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Recepción &amp; PIN</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              {conteoPendientes} por llegar
            </span>
          </button>

          <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-5 mb-2">
            Finanzas &amp; Demanda
          </p>

          <button
            type="button"
            onClick={() => onCambiarSeccion('finanzas')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              seccionActiva === 'finanzas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
              <span>Finanzas &amp; Cobros</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">
              BNB
            </span>
          </button>

          <button
            type="button"
            onClick={() => onCambiarSeccion('reportes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              seccionActiva === 'reportes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Tendencias &amp; Opiniones</span>
          </button>
        </nav>

        {/* Pie del Sidebar: Tema y regreso al Portal de Clientes */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Modo Oscuro</span>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              aria-label="Cambiar tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          <a
            href="http://localhost:3000/#/catalogo"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>Ir al Portal de Viajeros</span>
          </a>
        </div>
      </aside>
    </>
  );
};
