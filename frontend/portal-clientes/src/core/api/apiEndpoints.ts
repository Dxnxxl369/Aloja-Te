const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = env.VITE_API_GATEWAY_URL || (!isLocalhost ? 'https://aloja-te-admin.duckdns.org' : 'http://localhost:8080');
export const ANFITRION_URL = env.VITE_ANFITRION_URL || (!isLocalhost ? 'https://aloja-te-anfitrion.duckdns.org' : 'http://localhost:3005');
export const CLIENTES_URL = env.VITE_CLIENTES_URL || (!isLocalhost ? 'https://aloja-te.duckdns.org' : 'http://localhost:3000');
export const ADMIN_URL = env.VITE_ADMIN_URL || (!isLocalhost ? 'https://aloja-te-admin.duckdns.org' : 'http://localhost:4200');

export const ENDPOINTS = {
  // MS-01: Usuarios y Alojamientos
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  },
  ALOJAMIENTOS: {
    LISTAR: `${API_BASE_URL}/api/v1/alojamientos`,
    TODOS: `${API_BASE_URL}/api/v1/alojamientos/todos`,
    ANFITRION: (idAnfitrion: string) => `${API_BASE_URL}/api/v1/alojamientos/anfitrion/${idAnfitrion}`,
    PENDIENTES: `${API_BASE_URL}/api/v1/alojamientos/moderacion/pendientes`,
    DETALLE: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}`,
    UNIDADES: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}/unidades`,
    CATALOGOS: `${API_BASE_URL}/api/v1/catalogos`,
    VALORACIONES: (idAlojamiento: string) => `${API_BASE_URL}/api/v1/alojamientos/${idAlojamiento}/valoraciones`,
    VALORACIONES_HOTEL: (idAlojamiento: string) => `${API_BASE_URL}/api/v1/alojamientos/${idAlojamiento}/valoraciones/hotel`,
    VALORACIONES_UNIDAD: (idUnidad: string) => `${API_BASE_URL}/api/v1/unidades/${idUnidad}/valoraciones`,
    RESUMEN_VALORACIONES: (idAlojamiento: string) => `${API_BASE_URL}/api/v1/alojamientos/${idAlojamiento}/valoraciones/resumen`,
  },

  // MS-02: Reservas y Estadías (DynamoDB NoSQL)
  RESERVAS: {
    CREAR: `${API_BASE_URL}/api/v1/reservas`,
    LISTAR_TODAS: `${API_BASE_URL}/api/v1/reservas`,
    OBTENER: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}`,
    CONFIRMAR_PAGO: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/confirmar-pago`,
    CANCELAR: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/cancelar`,
    CHECK_IN: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-in`,
    CHECK_OUT: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-out`,
    CLIENTE_HISTORIAL: (clienteId: string) => `${API_BASE_URL}/api/v1/reservas/cliente/${clienteId}`,
    ANFITRION_HISTORIAL: (anfitrionId: string) => `${API_BASE_URL}/api/v1/reservas/anfitrion/${anfitrionId}`,
    DISPONIBILIDAD: (unidadId: string, checkIn: string, checkOut: string) =>
      `${API_BASE_URL}/api/v1/reservas/disponibilidad/${unidadId}?checkIn=${checkIn}&checkOut=${checkOut}`,
  },

  // MS-03: Comercial y Financiero (Laravel DDD)
  FINANZAS: {
    PAGOS: `${API_BASE_URL}/api/v1/pagos`,
    PAGO_DETALLE: (id: string) => `${API_BASE_URL}/api/v1/pagos/${id}`,
    WEBHOOK_BNB: `${API_BASE_URL}/api/v1/pagos/webhook/bnb`,
    REEMBOLSAR: (reservaId: string) => `${API_BASE_URL}/api/v1/pagos/${reservaId}/reembolsar`,
    LIQUIDACIONES: `${API_BASE_URL}/api/v1/finanzas/liquidaciones`,
    LIQUIDACIONES_ANFITRION: (anfitrionId: string) => `${API_BASE_URL}/api/v1/finanzas/liquidaciones/${anfitrionId}`,
    CONTABILIDAD: `${API_BASE_URL}/api/v1/finanzas/contabilidad`,
    REGLAS: `${API_BASE_URL}/api/v1/finanzas/reglas`,
    PROMOCION: (codigo: string) => `${API_BASE_URL}/api/v1/finanzas/promociones/${codigo}`,
  },

  // MS-01: Seguridad, Roles y Permisos (RBAC SaaS)
  SEGURIDAD: {
    ROLES: `${API_BASE_URL}/api/v1/seguridad/roles`,
    ROL_DETALLE: (id: number | string) => `${API_BASE_URL}/api/v1/seguridad/roles/${id}`,
    ROL_PERMISOS: (id: number | string) => `${API_BASE_URL}/api/v1/seguridad/roles/${id}/permisos`,
    PERMISOS: `${API_BASE_URL}/api/v1/seguridad/permisos`,
    MODULOS: `${API_BASE_URL}/api/v1/seguridad/modulos`,
  },

  // MS-04: IA & Copiloto (Clasificador de Reseñas NLP & Reportes)
  IA: {
    CLASIFICAR_RESENA: `${API_BASE_URL}/api/v1/ia/clasificar-resena`,
    PREDICT: `${API_BASE_URL}/api/v1/ia/predict`,
    BATCH: `${API_BASE_URL}/api/v1/ia/batch`,
    METRICAS: `${API_BASE_URL}/api/v1/ia/metricas-modelo`,
    HEALTH: `${API_BASE_URL}/api/v1/ia/health`,
  }
};
