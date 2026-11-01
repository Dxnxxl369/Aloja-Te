import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Plus, Check, CheckCircle2, UserCheck, Lock, 
  Eye, Edit3, KeyRound, Building2, Wallet, Users, Save, Sparkles, AlertCircle
} from 'lucide-react';
import { seguridadService, RolEquipo, PermisoItem } from '../services/seguridadService';

const MODULOS_HOTELEROS = [
  {
    idModulo: 1,
    codigoModulo: 'UNIDADES',
    nombre: 'Habitaciones & Tarifas',
    descripcion: 'Catálogo de habitaciones, disponibilidad y configuración de precios por noche',
    icono: Building2,
    permisoVer: { idPermiso: 101, idModulo: 1, codigo: 'UNIDADES_VER', nombre: 'Ver Habitaciones', descripcion: 'Consultar listado de habitaciones y tarifas', tipoAccion: 'VER' as const, asignable: true },
    permisoEditar: { idPermiso: 102, idModulo: 1, codigo: 'UNIDADES_EDITAR', nombre: 'Editar Habitaciones', descripcion: 'Modificar tarifas, fotos y disponibilidad', tipoAccion: 'EDITAR' as const, asignable: true },
  },
  {
    idModulo: 2,
    codigoModulo: 'RECEPCION',
    nombre: 'Recepción & Estadías',
    descripcion: 'Control presencial en mostrador, validación de PIN de ingreso y registro de salidas',
    icono: KeyRound,
    permisoVer: { idPermiso: 201, idModulo: 2, codigo: 'RECEPCION_VER', nombre: 'Ver Reservas', descripcion: 'Consultar huéspedes del día y calendario de llegadas', tipoAccion: 'VER' as const, asignable: true },
    permisoEditar: { idPermiso: 202, idModulo: 2, codigo: 'RECEPCION_EDITAR', nombre: 'Operar Recepción', descripcion: 'Validar PINs de seguridad y marcar ingresos/salidas oficiales', tipoAccion: 'EDITAR' as const, asignable: true },
  },
  {
    idModulo: 3,
    codigoModulo: 'FINANZAS',
    nombre: 'Finanzas & Liquidaciones',
    descripcion: 'Reportes contables, estados de cobro y transferencias bancarias de la empresa',
    icono: Wallet,
    permisoVer: { idPermiso: 301, idModulo: 3, codigo: 'FINANZAS_VER', nombre: 'Ver Finanzas', descripcion: 'Consultar liquidaciones, comprobantes y balances acumulados', tipoAccion: 'VER' as const, asignable: true },
    permisoEditar: { idPermiso: 302, idModulo: 3, codigo: 'FINANZAS_EDITAR', nombre: 'Administrar Cobros', descripcion: 'Configurar cuentas bancarias de cobro y transferencias', tipoAccion: 'EDITAR' as const, asignable: true },
  },
];

interface GestorRolesPermisosProps {
  onRolSimuladoCambio?: (rol: RolEquipo) => void;
}

export const GestorRolesPermisos: React.FC<GestorRolesPermisosProps> = ({ onRolSimuladoCambio }) => {
  const [roles, setRoles] = useState<RolEquipo[]>([]);
  const [rolSeleccionadoId, setRolSeleccionadoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario nuevo rol
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nombreNuevoRol, setNombreNuevoRol] = useState('');

  // Cargar roles al montar
  useEffect(() => {
    seguridadService.listarRoles().then((lista) => {
      setRoles(lista);
      if (lista.length > 0) {
        setRolSeleccionadoId(lista[0].idRol);
      }
    });
  }, []);

  const rolActivo = roles.find((r) => r.idRol === rolSeleccionadoId) || roles[0];

  const tienePermiso = (codigo: string): boolean => {
    if (!rolActivo || !rolActivo.permisos) return false;
    return rolActivo.permisos.some((p) => p.codigo === codigo);
  };

  const alternarPermiso = (permiso: PermisoItem) => {
    if (!rolActivo) return;

    let permisosActuales = [...(rolActivo.permisos || [])];
    const index = permisosActuales.findIndex((p) => p.codigo === permiso.codigo);

    if (index >= 0) {
      // Si se desmarca VER, automáticamente también se desmarca EDITAR de ese módulo
      if (permiso.tipoAccion === 'VER') {
        const moduloCodigo = permiso.codigo.split('_')[0];
        permisosActuales = permisosActuales.filter((p) => !p.codigo.startsWith(moduloCodigo));
      } else {
        permisosActuales.splice(index, 1);
      }
    } else {
      // Si se marca EDITAR, automáticamente también se marca VER de ese módulo
      if (permiso.tipoAccion === 'EDITAR') {
        const moduloDef = MODULOS_HOTELEROS.find((m) => m.idModulo === permiso.idModulo);
        if (moduloDef && !permisosActuales.some((p) => p.codigo === moduloDef.permisoVer.codigo)) {
          permisosActuales.push(moduloDef.permisoVer);
        }
      }
      permisosActuales.push(permiso);
    }

    const rolesActualizados = roles.map((r) =>
      r.idRol === rolActivo.idRol ? { ...r, permisos: permisosActuales } : r
    );
    setRoles(rolesActualizados);
  };

  const handleGuardarCambios = async () => {
    if (!rolActivo) return;
    setGuardando(true);
    setMensajeExito(null);

    await seguridadService.guardarPermisosDeRol(rolActivo.idRol, rolActivo.permisos || []);
    setGuardando(false);
    setMensajeExito(`Permisos del rol "${rolActivo.nombre}" guardados y aplicados correctamente.`);

    if (onRolSimuladoCambio) {
      onRolSimuladoCambio(rolActivo);
    }

    setTimeout(() => setMensajeExito(null), 3500);
  };

  const handleCrearNuevoRol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevoRol.trim()) return;

    const nuevo = await seguridadService.crearRol(nombreNuevoRol.trim(), 'HOTEL');
    setRoles((prev) => [...prev, nuevo]);
    setRolSeleccionadoId(nuevo.idRol);
    setNombreNuevoRol('');
    setMostrarModalNuevo(false);
    setMensajeExito(`Rol "${nuevo.nombre}" creado con éxito. Ahora puedes asignarle permisos.`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              CONTROL DE ACCESO Y EQUIPO • SAAS MULTIUSUARIO
            </span>
            <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Roles y Permisos de Personal
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMostrarModalNuevo(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Crear Nuevo Rol</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Configura los perfiles de tu equipo (administradores, recepcionistas, supervisores) y define con precisión si cada rol tiene permiso de solo <strong className="text-slate-700 dark:text-slate-200">VER</strong> o también de <strong className="text-slate-700 dark:text-slate-200">EDITAR Y OPERAR</strong> cada módulo de tus hoteles.
      </p>

      {/* Selector de Roles Creados */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {roles.map((rol) => {
          const esActivo = rol.idRol === rolActivo?.idRol;
          return (
            <button
              key={rol.idRol}
              type="button"
              onClick={() => setRolSeleccionadoId(rol.idRol)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                esActivo
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{rol.nombre}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                esActivo ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {rol.permisos?.length || 0} permisos
              </span>
            </button>
          );
        })}
      </div>

      {mensajeExito && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Matriz de Permisos por Módulo */}
      {rolActivo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Permisos asignados a: <strong className="text-blue-600 dark:text-blue-400">{rolActivo.nombre}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Marca las casillas correspondientes
            </span>
          </div>

          <div className="space-y-3">
            {MODULOS_HOTELEROS.map((modulo) => {
              const Icono = modulo.icono;
              const tieneVer = tienePermiso(modulo.permisoVer.codigo);
              const tieneEditar = tienePermiso(modulo.permisoEditar.codigo);

              return (
                <div
                  key={modulo.idModulo}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icono className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {modulo.nombre}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {modulo.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Acciones: VER y EDITAR */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    {/* Casilla VER */}
                    <label
                      onClick={() => alternarPermiso(modulo.permisoVer)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                        tieneVer
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        tieneVer ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {tieneVer && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Solo VER</span>
                    </label>

                    {/* Casilla EDITAR */}
                    <label
                      onClick={() => alternarPermiso(modulo.permisoEditar)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none ${
                        tieneEditar
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        tieneEditar ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {tieneEditar && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>EDITAR &amp; OPERAR</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Guardar Cambios */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando permisos...' : 'Guardar y Aplicar Permisos'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Rol */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900 dark:text-white">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Nuevo Rol de Personal</span>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalNuevo(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearNuevoRol} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Cargo o Rol
                </label>
                <input
                  type="text"
                  value={nombreNuevoRol}
                  onChange={(e) => setNombreNuevoRol(e.target.value)}
                  required
                  placeholder="Ej: Recepcionista Nocturno, Auditor de Habitaciones"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Una vez creado, podrás configurar qué módulos puede solo ver o editar según sus funciones operativas en el hotel.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
