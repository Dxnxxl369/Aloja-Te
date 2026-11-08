import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerfilAnfitrion } from '../types/anfitrion.types';
import { setSSOToken } from '../api/httpClient';

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
  cargandoSSO: boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  consultarSesionCentralSSO: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anfitrionClave, setAnfitrionClave] = useState<'carlos' | 'elena'>('carlos');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cargandoSSO, setCargandoSSO] = useState<boolean>(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alojate_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Limpieza defensiva de cualquier residuo previo en localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
      sessionStorage.removeItem('alojate_sso_session');
    } catch {}
  }, []);

  const consultarSesionCentralSSO = async () => {
    try {
      const resp = await fetch('http://localhost:8080/api/v1/auth/sso/session');
      if (resp.ok) {
        const data = await resp.json();
        if (data.authenticated && data.usuario) {
          const email = (data.usuario.email || '').toLowerCase();
          const nombre = (data.usuario.nombre || '').toLowerCase();
          const clave: 'carlos' | 'elena' = (email.includes('elena') || nombre.includes('elena')) ? 'elena' : 'carlos';
          
          setAnfitrionClave(clave);
          setIsAuthenticated(true);
          setSSOToken(data.token || null);
          setCargandoSSO(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[SSO Anfitrión] Error al conectar con Gateway central:', err);
    }

    setIsAuthenticated(false);
    setSSOToken(null);
    setCargandoSSO(false);
  };

  useEffect(() => {
    consultarSesionCentralSSO();

    // Revalidación en caliente cada vez que la pestaña toma foco
    const handleFocus = () => {
      consultarSesionCentralSSO();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

  const logout = async () => {
    try {
      // 1. Destrucción de la sesión en la autoridad central de SSO (Gateway)
      await fetch('http://localhost:8080/api/v1/auth/sso/logout', { method: 'POST' });
    } catch {}

    setIsAuthenticated(false);
    setSSOToken(null);

    // 2. Redirigir a la portada principal del portal de clientes
    window.location.href = 'http://localhost:3000/#/catalogo';
  };

  return (
    <AuthContext.Provider
      value={{
        perfil: PERFILES_ANFITRION[anfitrionClave],
        anfitrionClave,
        isAuthenticated,
        cargandoSSO,
        logout,
        darkMode,
        toggleDarkMode,
        consultarSesionCentralSSO
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
