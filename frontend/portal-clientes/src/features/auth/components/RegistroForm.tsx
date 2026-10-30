import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight, Loader2, Home, Compass, ShieldCheck, ChevronDown, ChevronUp, Building2, CreditCard } from 'lucide-react';

export const RegistroForm: React.FC = () => {
  const { loginSuccess } = useAuth();
  const [rol, setRol] = useState<'CLIENTE' | 'ANFITRION'>('CLIENTE');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Campos de Anfitrión
  const [ci, setCi] = useState('');
  const [ciComplemento, setCiComplemento] = useState('');
  const [ciExpedido, setCiExpedido] = useState('SC');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');
  const [direccionDomicilio, setDireccionDomicilio] = useState('');
  const [bancoNombre, setBancoNombre] = useState('Banco Nacional de Bolivia (BNB)');
  const [numeroCuentaBancaria, setNumeroCuentaBancaria] = useState('');
  const [mostrarOpcionales, setMostrarOpcionales] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.registro({
        nombre,
        apellido,
        email,
        password,
        telefono,
        ci: ci || undefined,
        ciComplemento: ciComplemento || undefined,
        ciExpedido: rol === 'ANFITRION' ? ciExpedido : undefined,
        telefonoEmergencia: telefonoEmergencia || undefined,
        direccionDomicilio: direccionDomicilio || undefined,
        bancoNombre: bancoNombre || undefined,
        numeroCuentaBancaria: numeroCuentaBancaria || undefined,
        rol,
      });

      loginSuccess(data.token, {
        id: data.usuario.id,
        email: data.usuario.email,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
        rol: data.usuario.rol,
      });
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      const serverMsg = err.response?.data?.mensaje || err.response?.data?.error || err.message;
      setError(serverMsg || 'Error al procesar registro en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector de Rol Exclusivo: Cliente o Anfitrión */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
          Tipo de Cuenta
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRol('CLIENTE')}
            className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              rol === 'CLIENTE'
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm font-semibold'
                : 'bg-stone-50 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold">Huésped / Viajero</span>
            <span className="text-[10px] text-stone-400 dark:text-slate-400">Buscar y reservar</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('ANFITRION')}
            className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              rol === 'ANFITRION'
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm font-semibold'
                : 'bg-stone-50 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold">Anfitrión Propietario</span>
            <span className="text-[10px] text-stone-400 dark:text-slate-400">Publicar hospedajes</span>
          </button>
        </div>
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">Nombre</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Juan"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            placeholder="Perez"
            className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Correo Electrónico */}
      <div>
        <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
        <div className="relative">
          <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu-correo@ejemplo.bo"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Teléfono & C.I. */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp</label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              placeholder="+591 70012345"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
            C.I. / NIT {rol === 'ANFITRION' && <span className="text-blue-600 font-bold">*</span>}
          </label>
          <input
            type="text"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            required={rol === 'ANFITRION'}
            placeholder="8492019"
            className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Bloque Especial para Anfitriones */}
      {rol === 'ANFITRION' && (
        <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-3 animate-fade-in text-xs">
          
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-300 block">
                Garantía de Seguridad para tus Huéspedes
              </span>
              <p className="text-[11px] text-blue-800 dark:text-blue-200/90 leading-relaxed mt-0.5">
                Tu perfil iniciará en estado <strong className="font-bold underline">Pendiente de Verificación</strong>. Los siguientes datos son opcionales en este momento; podrás completarlos luego desde tu panel antes de publicar alojamientos.
              </p>
            </div>
          </div>

          {/* Expedición de C.I. */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Expedido en
              </label>
              <select
                value={ciExpedido}
                onChange={(e) => setCiExpedido(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 transition"
              >
                <option value="SC">Santa Cruz (SC)</option>
                <option value="LP">La Paz (LP)</option>
                <option value="CB">Cochabamba (CB)</option>
                <option value="OR">Oruro (OR)</option>
                <option value="PT">Potosí (PT)</option>
                <option value="TJ">Tarija (TJ)</option>
                <option value="CH">Chuquisaca (CH)</option>
                <option value="BE">Beni (BE)</option>
                <option value="PD">Pando (PD)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                Complemento C.I. <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={ciComplemento}
                onChange={(e) => setCiComplemento(e.target.value)}
                placeholder="Ej: 1A"
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Desplegable de Datos Opcionales (Banco, Emergencia, Domicilio) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setMostrarOpcionales(!mostrarOpcionales)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition"
            >
              <span>{mostrarOpcionales ? 'Ocultar datos bancarios y de respaldo' : '+ Añadir cuenta bancaria y contacto de respaldo ahora'}</span>
              {mostrarOpcionales ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {mostrarOpcionales && (
              <div className="space-y-2.5 mt-2.5 pt-2 border-t border-blue-200 dark:border-blue-900/50">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Entidad Bancaria para Liquidaciones
                  </label>
                  <select
                    value={bancoNombre}
                    onChange={(e) => setBancoNombre(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="Banco Nacional de Bolivia (BNB)">Banco Nacional de Bolivia (BNB)</option>
                    <option value="Banco Unión">Banco Unión S.A.</option>
                    <option value="Banco Mercantil Santa Cruz">Banco Mercantil Santa Cruz</option>
                    <option value="Banco BISA">Banco BISA</option>
                    <option value="Banco Ganadero">Banco Ganadero</option>
                    <option value="Banco FIE">Banco FIE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Número de Cuenta Bancaria (BOB)
                  </label>
                  <input
                    type="text"
                    value={numeroCuentaBancaria}
                    onChange={(e) => setNumeroCuentaBancaria(e.target.value)}
                    placeholder="2000-1928371-01"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Teléfono de Contacto de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={telefonoEmergencia}
                    onChange={(e) => setTelefonoEmergencia(e.target.value)}
                    placeholder="+591 71098765"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 dark:text-slate-300 mb-1">
                    Dirección Domiciliaria del Anfitrión
                  </label>
                  <input
                    type="text"
                    value={direccionDomicilio}
                    onChange={(e) => setDireccionDomicilio(e.target.value)}
                    placeholder="Calle o Av. donde resides habitualmente"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Contraseña */}
      <div>
        <label className="block text-[11px] font-semibold text-stone-700 dark:text-slate-300 mb-1">Contraseña</label>
        <div className="relative">
          <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-700/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creando cuenta de {rol.toLowerCase()}...</span>
          </>
        ) : (
          <>
            <span>Completar Registro</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
