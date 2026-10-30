import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { LoginForm } from '../components/LoginForm';
import { RegistroForm } from '../components/RegistroForm';
import { X, Sparkles, KeyRound } from 'lucide-react';

export const AuthLiquidModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authModalMode || 'login');

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Main Container - Royal Blue & White / Dark Slate matching image.png */}
      <div className="relative w-full max-w-lg my-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden animate-modal-in flex flex-col p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                ALOJA-TE BOLIVIA • ACCESO SEGURO
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {tab === 'login' ? 'Bienvenido de Vuelta' : 'Crea tu Cuenta'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {tab === 'login'
                  ? 'Accede para gestionar tus reservas o tus alojamientos'
                  : 'Únete a la red nacional de hospitalidad boliviana'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 mb-5 text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              tab === 'login'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-xl transition ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Dynamic Form */}
        <div className="transition-all duration-300">
          {tab === 'login' ? <LoginForm /> : <RegistroForm />}
        </div>
      </div>
    </div>
  );
};
