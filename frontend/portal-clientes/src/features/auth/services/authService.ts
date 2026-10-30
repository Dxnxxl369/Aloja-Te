import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/apiEndpoints';
import { LoginCredentials, RegistroData, AuthResponse } from '../types/auth.types';

function normalizarAuthResponse(raw: any): AuthResponse {
  if (raw.usuario && raw.usuario.id) {
    return raw as AuthResponse;
  }

  // Armonizar formato plano de MS-01 (usuarioId, nombreCompleto, rol, estado, etc.)
  const partes = (raw.nombreCompleto || 'Usuario Aloja-Te').split(' ');
  const nombre = partes[0] || 'Usuario';
  const apellido = partes.slice(1).join(' ') || '';

  return {
    token: raw.token,
    usuario: {
      id: raw.usuarioId || raw.id || 'default-id',
      email: raw.email,
      nombre: raw.nombre || nombre,
      apellido: raw.apellido || apellido,
      rol: (raw.rol as any) || 'CLIENTE',
      tipoCuenta: raw.tipoCuenta || (typeof raw.estado === 'string' ? raw.estado : 'ACTIVO'),
    }
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<any>(ENDPOINTS.AUTH.LOGIN, credentials);
    return normalizarAuthResponse(response.data);
  },

  async registro(data: RegistroData): Promise<AuthResponse> {
    const response = await httpClient.post<any>(ENDPOINTS.AUTH.REGISTER, data);
    return normalizarAuthResponse(response.data);
  }
};
