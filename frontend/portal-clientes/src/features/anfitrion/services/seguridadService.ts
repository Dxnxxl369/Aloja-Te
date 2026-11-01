import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';

export interface PermisoItem {
  idPermiso: number;
  idModulo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoAccion: 'VER' | 'EDITAR';
  asignable: boolean;
}

export interface ModuloItem {
  idModulo: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface RolEquipo {
  idRol: number;
  nombre: string;
  ambito: string;
  esSistema: boolean;
  activo: boolean;
  permisos: PermisoItem[];
}

const ROLES_DEFAULT_STORAGE_KEY = 'alojate_roles_equipo_hotel';

const ROLES_INICIALES: RolEquipo[] = [
  {
    idRol: 1,
    nombre: 'Administrador Hotelero',
    ambito: 'HOTEL',
    esSistema: true,
    activo: true,
    permisos: [
      { idPermiso: 101, idModulo: 1, codigo: 'UNIDADES_VER', nombre: 'Ver Habitaciones', descripcion: 'Consultar catálogo de habitaciones y tarifas', tipoAccion: 'VER', asignable: true },
      { idPermiso: 102, idModulo: 1, codigo: 'UNIDADES_EDITAR', nombre: 'Editar Habitaciones', descripcion: 'Modificar tarifas, fotos y disponibilidad', tipoAccion: 'EDITAR', asignable: true },
      { idPermiso: 201, idModulo: 2, codigo: 'RECEPCION_VER', nombre: 'Ver Reservas', descripcion: 'Consultar huéspedes del día y calendario', tipoAccion: 'VER', asignable: true },
      { idPermiso: 202, idModulo: 2, codigo: 'RECEPCION_EDITAR', nombre: 'Gestionar Check-in/Out', descripcion: 'Validar PINs y registrar entradas y salidas', tipoAccion: 'EDITAR', asignable: true },
      { idPermiso: 301, idModulo: 3, codigo: 'FINANZAS_VER', nombre: 'Ver Finanzas', descripcion: 'Consultar liquidaciones, comprobantes y balances', tipoAccion: 'VER', asignable: true },
      { idPermiso: 302, idModulo: 3, codigo: 'FINANZAS_EDITAR', nombre: 'Gestionar Finanzas', descripcion: 'Configurar cuentas bancarias y solicitar desembolsos', tipoAccion: 'EDITAR', asignable: true },
    ],
  },
  {
    idRol: 2,
    nombre: 'Recepcionista de Turno',
    ambito: 'HOTEL',
    esSistema: false,
    activo: true,
    permisos: [
      { idPermiso: 101, idModulo: 1, codigo: 'UNIDADES_VER', nombre: 'Ver Habitaciones', descripcion: 'Consultar catálogo de habitaciones y tarifas', tipoAccion: 'VER', asignable: true },
      { idPermiso: 201, idModulo: 2, codigo: 'RECEPCION_VER', nombre: 'Ver Reservas', descripcion: 'Consultar huéspedes del día y calendario', tipoAccion: 'VER', asignable: true },
      { idPermiso: 202, idModulo: 2, codigo: 'RECEPCION_EDITAR', nombre: 'Gestionar Check-in/Out', descripcion: 'Validar PINs y registrar entradas y salidas', tipoAccion: 'EDITAR', asignable: true },
    ],
  },
  {
    idRol: 3,
    nombre: 'Supervisor de Pisos / Atención',
    ambito: 'HOTEL',
    esSistema: false,
    activo: true,
    permisos: [
      { idPermiso: 101, idModulo: 1, codigo: 'UNIDADES_VER', nombre: 'Ver Habitaciones', descripcion: 'Consultar catálogo de habitaciones y tarifas', tipoAccion: 'VER', asignable: true },
      { idPermiso: 201, idModulo: 2, codigo: 'RECEPCION_VER', nombre: 'Ver Reservas', descripcion: 'Consultar huéspedes del día y calendario', tipoAccion: 'VER', asignable: true },
    ],
  },
];

export const seguridadService = {
  async listarRoles(): Promise<RolEquipo[]> {
    try {
      const resp = await httpClient.get<RolEquipo[]>(ENDPOINTS.SEGURIDAD.ROLES);
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        return resp.data;
      }
    } catch {
      // Fallback a almacenamiento local
    }

    try {
      const saved = localStorage.getItem(ROLES_DEFAULT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    localStorage.setItem(ROLES_DEFAULT_STORAGE_KEY, JSON.stringify(ROLES_INICIALES));
    return ROLES_INICIALES;
  },

  async crearRol(nombre: string, ambito = 'HOTEL'): Promise<RolEquipo> {
    const nuevoRol: RolEquipo = {
      idRol: Date.now(),
      nombre,
      ambito,
      esSistema: false,
      activo: true,
      permisos: [],
    };

    try {
      const resp = await httpClient.post<RolEquipo>(ENDPOINTS.SEGURIDAD.ROLES, {
        nombre,
        ambito,
        esSistema: false,
        activo: true,
      });
      if (resp.data) {
        nuevoRol.idRol = resp.data.idRol || nuevoRol.idRol;
      }
    } catch {}

    // Guardar en almacenamiento local
    const rolesActuales = await this.listarRoles();
    const actualizados = [...rolesActuales, nuevoRol];
    localStorage.setItem(ROLES_DEFAULT_STORAGE_KEY, JSON.stringify(actualizados));

    return nuevoRol;
  },

  async guardarPermisosDeRol(idRol: number, permisosActualizados: PermisoItem[]): Promise<void> {
    try {
      const idsPermisos = permisosActualizados.map((p) => p.idPermiso);
      await httpClient.put(ENDPOINTS.SEGURIDAD.ROL_PERMISOS(idRol), { idsPermisos });
    } catch {}

    const rolesActuales = await this.listarRoles();
    const actualizados = rolesActuales.map((r) =>
      r.idRol === idRol ? { ...r, permisos: permisosActualizados } : r
    );
    localStorage.setItem(ROLES_DEFAULT_STORAGE_KEY, JSON.stringify(actualizados));
  },
};
