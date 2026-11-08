import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Check } from 'lucide-react';

interface PerfilDemo {
  id: string;
  nombre: string;
  email: string;
  pass: string;
  rol: 'ANFITRION' | 'CLIENTE';
  rolTexto: string;
  descripcion: string;
  icono: string;
}

const PERFILES_DEMO: PerfilDemo[] = [
  {
    id: 'anf-carlos',
    nombre: 'Carlos Mendoza',
    email: 'anfitrion@alojate.bo',
    pass: 'Anfitrion1234!',
    rol: 'ANFITRION',
    rolTexto: 'Anfitrión Verificado',
    descripcion: 'Los Tajibos & Cabaña El Palmar',
    icono: '🏨',
  },
  {
    id: 'anf-elena',
    nombre: 'Elena Morales',
    email: 'elena.calbimontes@alojate.bo',
    pass: 'Anfitrion1234!',
    rol: 'ANFITRION',
    rolTexto: 'Anfitriona Verificada',
    descripcion: 'Chalet Viñedos & Lodge Illimani',
    icono: '🍇',
  },
  {
    id: 'cli-lucia',
    nombre: 'Lucia Suarez',
    email: 'cliente@alojate.bo',
    pass: 'Cliente1234!',
    rol: 'CLIENTE',
    rolTexto: 'Huésped Frecuente',
    descripcion: 'Viajes Santa Cruz y Reservas',
    icono: '🧳',
  },
  {
    id: 'cli-juan',
    nombre: 'Juan Perez',
    email: 'juan.perez@alojate.bo',
    pass: 'Cliente1234!',
    rol: 'CLIENTE',
    rolTexto: 'Huésped Nacional',
    descripcion: 'Ecoturismo Samaipata & Tarija',
    icono: '🎒',
  },
];

export const LoginForm: React.FC = () => {
  const { loginSuccess } = useAuth();
  const [email, setEmail] = useState('cliente@alojate.bo');
  const [password, setPassword] = useState('Cliente1234!');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string>('cli-lucia');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const seleccionarPerfil = (p: PerfilDemo) => {
    setEmail(p.email);
    setPassword(p.pass);
    setPerfilSeleccionado(p.id);
    setError(null);
  };

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
      setError(serverMsg || 'Credenciales inválidas o error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Perfiles Rápidos para Acceso Inmediato */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
            Acceso Rápido • 4 Perfiles Demo:
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            Clic para autorellenar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {PERFILES_DEMO.map((p) => {
            const activo = email.toLowerCase() === p.email.toLowerCase() || perfilSeleccionado === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => seleccionarPerfil(p)}
                className={`p-2.5 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                  activo
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <span>{p.icono}</span>
                    <span>{p.nombre}</span>
                  </div>
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      p.rol === 'ANFITRION'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    }`}
                  >
                    {p.rolTexto}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                    {p.email}
                  </span>
                </div>
                {activo && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@alojate.bo"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validando credenciales en Aloja-Te...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión en la Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
