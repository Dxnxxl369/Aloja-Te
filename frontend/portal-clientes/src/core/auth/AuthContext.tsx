import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioSesion, TokenStorage } from './TokenStorage';
import { API_BASE_URL } from '../api/apiEndpoints';

interface AuthContextType {
  user: UsuarioSesion | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR';
  setRole: (role: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR') => void;
  loginSuccess: (token: string, user: UsuarioSesion) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultMode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  verificarSesionSSO: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR'>('CLIENTE');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Consulta la sesión activa directamente a la autoridad central de SSO en el Gateway
  const verificarSesionSSO = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/sso/session`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.authenticated && data.usuario) {
          setToken(data.token);
          setUser(data.usuario);
          setActiveRole(data.usuario.rol);
          TokenStorage.saveSession(data.token, data.usuario);
          return;
        }
      }
    } catch (err) {
      console.warn('[SSO Clientes] Error al conectar con Gateway central:', err);
    }

    setToken(null);
    setUser(null);
    TokenStorage.clearSession();
  };

  useEffect(() => {
    verificarSesionSSO();

    // Revalidación reactiva de sesión central al enfocar la pestaña (evita desincronizaciones entre ventanas)
    const handleFocus = () => {
      verificarSesionSSO();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loginSuccess = (newToken: string, newUser: UsuarioSesion) => {
    setToken(newToken);
    setUser(newUser);
    setActiveRole(newUser.rol);
    TokenStorage.saveSession(newToken, newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    TokenStorage.clearSession();
    // Revocar sesión global en el API Gateway SSO
    fetch(`${API_BASE_URL}/api/v1/auth/sso/logout`, { method: 'POST' }).catch(() => {});
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        activeRole,
        setRole: setActiveRole,
        loginSuccess,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        verificarSesionSSO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
