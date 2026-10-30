import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { loginSuccess } = useAuth();
  const [email, setEmail] = useState('lucia.suarez@alojate.bo');
  const [password, setPassword] = useState('Bolivia2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      loginSuccess(data.token, {
        id: data.usuario.id,
        email: data.usuario.email,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
        rol: data.usuario.rol,
      });
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      const serverMsg = err.response?.data?.mensaje || err.response?.data?.error || err.message;
      setError(serverMsg || 'Credenciales inválidas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">Correo Electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-stone-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@alojate.bo"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">Contraseña</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-stone-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 pt-1">
        <span>¿Olvidaste tu contraseña?</span>
        <span className="text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline">
          Recuperar acceso
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validando credenciales...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-slate-900/80 border border-stone-200/90 dark:border-slate-800 text-xs space-y-2">
        <span className="font-semibold text-stone-800 dark:text-slate-200 block text-[11px]">
          Selección Rápida de Perfil de Prueba:
        </span>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => {
              setEmail('lucia.suarez@alojate.bo');
              setPassword('Bolivia2026!');
            }}
            className="p-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-brand-500 text-left transition"
          >
            <span className="font-bold text-stone-900 dark:text-white block">Huésped / Viajero</span>
            <span className="text-stone-500 dark:text-slate-400 font-mono text-[9px] truncate block">lucia.suarez@alojate.bo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('anfitrion@alojate.bo');
              setPassword('Anfitrion1234!');
            }}
            className="p-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-brand-500 text-left transition"
          >
            <span className="font-bold text-brand-600 dark:text-brand-400 block">Anfitrión Propietario</span>
            <span className="text-stone-500 dark:text-slate-400 font-mono text-[9px] truncate block">anfitrion@alojate.bo</span>
          </button>
        </div>
        <p className="text-[10px] text-stone-500 dark:text-slate-400 italic">
          💡 Puedes consultar todas las cuentas de prueba en el archivo <code className="font-mono text-brand-600 dark:text-brand-400">usuarios.txt</code>.
        </p>
      </div>
    </form>
  );
};
