export const API_BASE_URL = (import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const ENDPOINTS = {
  // MS-01: Usuarios y Alojamientos
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  },
  ALOJAMIENTOS: {
    LISTAR: `${API_BASE_URL}/api/v1/alojamientos`,
    DETALLE: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}`,
    UNIDADES: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}/unidades`,
    CATALOGOS: `${API_BASE_URL}/api/v1/catalogos`,
  },

  // MS-02: Reservas y Estadías (DynamoDB NoSQL)
  RESERVAS: {
    CREAR: `${API_BASE_URL}/api/v1/reservas`,
    LISTAR_TODAS: `${API_BASE_URL}/api/v1/reservas`,
    OBTENER: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}`,
    CONFIRMAR_PAGO: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/confirmar-pago`,
    CHECK_IN: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-in`,
    CHECK_OUT: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-out`,
    CLIENTE_HISTORIAL: (clienteId: string) => `${API_BASE_URL}/api/v1/reservas/cliente/${clienteId}`,
    ANFITRION_HISTORIAL: (anfitrionId: string) => `${API_BASE_URL}/api/v1/reservas/anfitrion/${anfitrionId}`,
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
  }
};
