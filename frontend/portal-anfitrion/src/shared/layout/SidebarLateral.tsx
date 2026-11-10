import React from 'react';
import {
  LayoutDashboard,
  Home,
  KeyRound,
  BadgeDollarSign,
  Sparkles,
  User,
  Moon,
  Sun,
  ExternalLink,
  LogOut,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAnfitrionAuth } from '../../core/auth/AuthContext';
import { CLIENTES_URL } from '../../core/api/apiEndpoints';

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
  const { perfil, logout, darkMode, toggleDarkMode } = useAnfitrionAuth();

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 shadow-xl lg:shadow-none ${
          menuMovilAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Marca / Logo */}
          <div className="h-14 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-serif font-bold text-base flex items-center justify-center shadow-sm">
                A
              </div>
              <span className="font-serif font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Aloja-Te
              </span>
              <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded-md">
                Host
              </span>
            </div>

            <button
              type="button"
              onClick={onCerrarMenuMovil}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta de Anfitrión: 2 líneas con verificación discreta (Click abre Mi Perfil) */}
          <button
            type="button"
            onClick={() => onCambiarSeccion('perfil')}
            className={`w-full text-left px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
              seccionActiva === 'perfil' ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                {perfil.avatarUrl ? (
                  <img
                    src={perfil.avatarUrl}
                    alt={perfil.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{perfil.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {perfil.nombre}
                  </span>
                  {perfil.verificado && (
                    <span title="Anfitrión Verificado" className="inline-flex">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {perfil.ciudad} · {perfil.email}
                </p>
              </div>
            </div>
          </button>

          {/* Navegación Principal */}
          <nav className="px-3 py-3 space-y-1">
            <button
              type="button"
              onClick={() => onCambiarSeccion('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'dashboard'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onCambiarSeccion('alojamientos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'alojamientos'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                <span>Mis Alojamientos</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {conteoAlojamientos}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onCambiarSeccion('recepcion')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'recepcion'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4" />
                <span>Recepción &amp; PIN</span>
              </div>
              {conteoPendientes > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  {conteoPendientes} hoy
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onCambiarSeccion('finanzas')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'finanzas'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BadgeDollarSign className="w-4 h-4" />
                <span>Finanzas</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onCambiarSeccion('reportes')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'reportes'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Reportes IA</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onCambiarSeccion('perfil')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                seccionActiva === 'perfil'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Mi Perfil</span>
              </div>
              {perfil.verificado && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          </nav>
        </div>

        {/* Pie del Sidebar: Tema, catálogo y Cerrar Sesión */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between px-2.5 py-1 text-slate-500 dark:text-slate-400">
            <span className="text-[11px]">Modo Oscuro</span>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Cambiar tema"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>

          <a
            href={`${CLIENTES_URL}/#/catalogo`}
            className="flex items-center gap-2 px-2.5 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">Volver al Catálogo</span>
          </a>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};