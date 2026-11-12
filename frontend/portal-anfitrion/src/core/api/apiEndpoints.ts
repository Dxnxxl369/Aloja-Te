const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = env.VITE_API_GATEWAY_URL || (!isLocalhost ? 'https://aloja-te-admin.duckdns.org' : 'http://localhost:8080');
export const ANFITRION_URL = env.VITE_ANFITRION_URL || (!isLocalhost ? 'https://aloja-te-anfitrion.duckdns.org' : 'http://localhost:3005');
export const CLIENTES_URL = env.VITE_CLIENTES_URL || (!isLocalhost ? 'https://aloja-te.duckdns.org' : 'http://localhost:3000');
export const ADMIN_URL = env.VITE_ADMIN_URL || (!isLocalhost ? 'https://aloja-te-admin.duckdns.org' : 'http://localhost:4200');

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
