export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR';
}

// Almacén estrictamente en memoria volátil de tiempo de ejecución (Zero LocalStorage Cache)
let ssoMemoryToken: string | null = null;
let ssoMemoryUser: UsuarioSesion | null = null;

export const TokenStorage = {
  saveSession(token: string, usuario: UsuarioSesion): void {
    ssoMemoryToken = token;
    ssoMemoryUser = usuario;
    // Purgar defensivamente cualquier residuo en localStorage para evitar credenciales cacheadas
    try {
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
    } catch {}
  },

  getToken(): string | null {
    return ssoMemoryToken;
  },

  getUser(): UsuarioSesion | null {
    return ssoMemoryUser;
  },

  clearSession(): void {
    ssoMemoryToken = null;
    ssoMemoryUser = null;
    try {
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
      localStorage.removeItem('alojate_mis_reservas');
      sessionStorage.clear();
    } catch {}
  }
};
