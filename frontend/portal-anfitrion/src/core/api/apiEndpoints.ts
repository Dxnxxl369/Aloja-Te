export const API_BASE_URL = (import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const ENDPOINTS = {
  ALOJAMIENTOS: {
    LISTAR: `${API_BASE_URL}/api/v1/alojamientos`,
    DETALLE: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}`,
    UNIDADES: (id: string) => `${API_BASE_URL}/api/v1/alojamientos/${id}/unidades`,
    POR_ANFITRION: (idAnfitrion: string) => `${API_BASE_URL}/api/v1/alojamientos/anfitrion/${idAnfitrion}`,
  },
  RESERVAS: {
    CHECK_IN: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-in`,
    CHECK_OUT: (id: string) => `${API_BASE_URL}/api/v1/reservas/${id}/check-out`,
    ANFITRION: (anfitrionId: string) => `${API_BASE_URL}/api/v1/reservas/anfitrion/${anfitrionId}`,
  },
  FINANZAS: {
    LIQUIDACIONES: (anfitrionId: string) => `${API_BASE_URL}/api/v1/finanzas/liquidaciones/${anfitrionId}`,
  }
};
