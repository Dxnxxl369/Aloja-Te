import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerfilAnfitrion } from '../types/anfitrion.types';

export const PERFILES_ANFITRION: Record<string, PerfilAnfitrion> = {
  carlos: {
    id: 'carlos-mendoza-scz',
    nombre: 'Carlos Mendoza Cuéllar',
    email: 'anfitrion@alojate.bo',
    ciudad: 'Santa Cruz',
    descripcion: 'Operador de hospedajes coloniales y rústicos en el departamento de Santa Cruz. Documentación legal y cuenta BNB acreditada al 100%.',
    cuentaBNB: 'Titular: Carlos Mendoza Cuéllar • Caja de Ahorro: 150-0892341-01',
    saldoDisponible: 'Bs. 3,420',
    verificado: true,
    kpis: {
      ingresosNetos: 'Bs. 14,850',
      tasaOcupacion: '82.5%',
      huespedesActivos: '2 Activos',
      reputacion: '4.96 ★'
    }
  },
  elena: {
    id: 'elena-morales-trj',
    nombre: 'Elena Morales Calbimontes',
    email: 'elena.calbimontes@alojate.bo',
    ciudad: 'Tarija & La Paz',
    descripcion: 'Operadora de turismo vitivinícola en el Valle Central de Tarija y residencias de altura en La Paz. Calificación de excelencia turística.',
    cuentaBNB: 'Titular: Elena Morales Calbimontes • Caja de Ahorro: 150-0439120-02',
    saldoDisponible: 'Bs. 5,180',
    verificado: true,
    kpis: {
      ingresosNetos: 'Bs. 18,200',
      tasaOcupacion: '88.0%',
      huespedesActivos: '1 Activo',
      reputacion: '4.98 ★'
    }
  }
};

interface AuthContextType {
  perfil: PerfilAnfitrion;
  anfitrionClave: 'carlos' | 'elena';
  isAuthenticated: boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detección estricta y profesional de la sesión activa desde localStorage (portal-clientes)
  const [anfitrionClave, setAnfitrionClave] = useState<'carlos' | 'elena'>(() => {
    try {
      const rawUser = localStorage.getItem('alojate_user_profile');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const email = (u.email || '').toLowerCase();
        const nombre = (u.nombre || '').toLowerCase();
        if (email.includes('elena') || nombre.includes('elena')) {
          return 'elena';
        }
        return 'carlos';
      }
    } catch {}
    return 'carlos';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem('alojate_jwt_token');
      const user = localStorage.getItem('alojate_user_profile');
      return !!(token && user);
    } catch {
      return false;
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alojate_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Sincronizar en caliente si la sesión cambia en otra pestaña o en portal-clientes
  useEffect(() => {
    const sincronizarSesion = () => {
      try {
        const rawUser = localStorage.getItem('alojate_user_profile');
        const token = localStorage.getItem('alojate_jwt_token');
        setIsAuthenticated(!!(token && rawUser));

        if (rawUser) {
          const u = JSON.parse(rawUser);
          const email = (u.email || '').toLowerCase();
          const nombre = (u.nombre || '').toLowerCase();
          if (email.includes('elena') || nombre.includes('elena')) {
            setAnfitrionClave('elena');
          } else {
            setAnfitrionClave('carlos');
          }
        }
      } catch {}
    };

    window.addEventListener('storage', sincronizarSesion);
    return () => window.removeEventListener('storage', sincronizarSesion);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('alojate_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('alojate_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const logout = () => {
    try {
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
      localStorage.removeItem('alojate_mis_reservas');
      sessionStorage.clear();
    } catch {}
    setIsAuthenticated(false);
    // Redirigir limpiamente a la portada principal
    window.location.href = 'http://localhost:3000/#/catalogo';
  };

  return (
    <AuthContext.Provider
      value={{
        perfil: PERFILES_ANFITRION[anfitrionClave],
        anfitrionClave,
        isAuthenticated,
        logout,
        darkMode,
        toggleDarkMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAnfitrionAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAnfitrionAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
