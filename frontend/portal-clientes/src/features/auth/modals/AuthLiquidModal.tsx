import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { LoginForm } from '../components/LoginForm';
import { RegistroForm } from '../components/RegistroForm';
import { X, Sparkles } from 'lucide-react';

export const AuthLiquidModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authModalMode || 'login');

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Bimodal Liquid Glass Modal Container */}
      <div className="relative w-full max-w-lg my-6 p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111722]/95 text-stone-900 dark:text-white shadow-2xl z-10 animate-modal-in overflow-hidden border border-stone-200/90 dark:border-cyan-500/30 backdrop-blur-2xl transition-colors duration-300">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-500/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10 dark:bg-brand-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600 dark:text-cyan-400" /> Aloja-Te Bolivia
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              {tab === 'login' ? 'Bienvenido de Vuelta' : 'Crear tu Cuenta'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-300 mt-0.5">
              {tab === 'login'
                ? 'Accede para gestionar tus reservas o tus alojamientos'
                : 'Únete a la red nacional de hospitalidad boliviana'}
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-500 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/60 mb-5 text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl transition ${
              tab === 'login'
                ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl transition ${
              tab === 'register'
                ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Dynamic form */}
        <div className="transition-all duration-300">
          {tab === 'login' ? <LoginForm /> : <RegistroForm />}
        </div>
      </div>
    </div>
  );
};
