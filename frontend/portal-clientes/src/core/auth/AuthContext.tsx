import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioSesion, TokenStorage } from './TokenStorage';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR'>('CLIENTE');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const savedToken = TokenStorage.getToken();
    const savedUser = TokenStorage.getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setActiveRole(savedUser.rol);
    } else {
      setToken(null);
      setUser(null);
    }
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
