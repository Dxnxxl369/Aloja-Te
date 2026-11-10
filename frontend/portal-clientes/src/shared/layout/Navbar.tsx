import React from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { ANFITRION_URL, ADMIN_URL } from '../../core/api/apiEndpoints';
import { Sun, Moon, Sparkles, User, LogOut, Compass, KeyRound, DollarSign, ExternalLink, Building2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'catalogo' | 'mis-viajes' | 'anfitrion' | 'detalle';
  onChangeView: (view: 'catalogo' | 'mis-viajes' | 'anfitrion') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  darkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const { user, token, openAuthModal, logout, activeRole, setRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafc]/90 dark:bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => onChangeView('catalogo')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Aloja<span className="text-blue-600 dark:text-blue-400">-Te</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Bolivia
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Plataforma Nacional de Alojamientos
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => onChangeView('catalogo')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'catalogo'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explorar</span>
          </button>

          <button
            onClick={() => onChangeView('mis-viajes')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'mis-viajes'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Mis Reservas &amp; PIN</span>
          </button>

          {/* Panel Anfitrión Oficial: Exclusivo para usuarios con rol ANFITRION */}
          {user?.rol === 'ANFITRION' && (
            <a
              href={`${ANFITRION_URL}?sso_token=${encodeURIComponent(token || '')}&sso_email=${encodeURIComponent(user.email || '')}&sso_nombre=${encodeURIComponent(user.nombre || '')}&sso_rol=ANFITRION`}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white transition flex items-center gap-1.5 font-bold text-xs shadow-md shadow-blue-500/25"
              title="Abrir Panel Oficial de Gestión del Anfitrión"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Panel Anfitrión</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}

          {/* Panel Admin Oficial: Exclusivo para administradores o correos de administración */}
          {(user?.rol === 'ADMINISTRADOR' || (user?.rol as string) === 'ADMIN' || user?.email?.toLowerCase().includes('admin')) && (
            <a
              href={ADMIN_URL}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:opacity-95 text-white transition flex items-center gap-1.5 font-bold text-xs shadow-md shadow-blue-500/25"
              title="Abrir Panel Oficial de Administración (4200)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Admin</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}
        </nav>

        {/* Right Action Icons & User */}
        <div className="flex items-center gap-2.5">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-blue-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Botón para registrarse como Anfitrión (solo si no es anfitrión) */}
          {(!user || user.rol === 'CLIENTE') && (
            <button
              onClick={() => openAuthModal('register')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition"
            >
              <span>Publica tu espacio</span>
            </button>
          )}

          {/* User profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user.nombre} {user.apellido}
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {user.rol === 'ANFITRION'
                    ? 'Anfitrión'
                    : user.rol === 'ADMINISTRADOR'
                    ? 'Administrador'
                    : 'Viajero'}
                </span>
              </div>

              <button
                onClick={onLogout ? onLogout : logout}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
