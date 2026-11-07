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

export interface SSOSessionData {
  usuarioId: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  token: string;
  ts: number;
}

interface AuthContextType {
  perfil: PerfilAnfitrion;
  anfitrionClave: 'carlos' | 'elena';
  isAuthenticated: boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Resuelve la sesión activa mediante SSO Handshake sin depender de caché persistente en localStorage.
 */
function resolverSesionInicial(): { clave: 'carlos' | 'elena'; autenticado: boolean } {
  // Limpieza defensiva de cualquier residuo previo en localStorage (cero caché de credenciales)
  try {
    localStorage.removeItem('alojate_jwt_token');
    localStorage.removeItem('alojate_user_profile');
  } catch {}

  if (typeof window !== 'undefined') {
    // 1. Extraer ticket SSO de los parámetros de la URL
    const searchParams = new URLSearchParams(window.location.search);
    const ssoTicket = searchParams.get('sso_ticket');

    if (ssoTicket) {
      try {
        const decoded = decodeURIComponent(escape(atob(ssoTicket)));
        const data: SSOSessionData = JSON.parse(decoded);
        if (data && (data.email || data.nombre)) {
          const email = (data.email || '').toLowerCase();
          const nombre = (data.nombre || '').toLowerCase();
          const clave: 'carlos' | 'elena' = (email.includes('elena') || nombre.includes('elena')) ? 'elena' : 'carlos';

          // Guardar estrictamente en sessionStorage de la pestaña activa (se destruye al cerrar navegador/pestaña)
          sessionStorage.setItem('alojate_sso_session', JSON.stringify({ data, clave }));

          // Limpiar inmediatamente el ticket de la barra de direcciones para mantener la URL pulcra
          window.history.replaceState({}, document.title, window.location.pathname);
          return { clave, autenticado: true };
        }
      } catch (err) {
        console.warn('[SSO] Error al decodificar ticket SSO:', err);
      }
    }

    // 2. Si no viene en la URL, verificar la memoria de la pestaña activa (sessionStorage para recargas F5)
    try {
      const sesionVolatil = sessionStorage.getItem('alojate_sso_session');
      if (sesionVolatil) {
        const parsed = JSON.parse(sesionVolatil);
        if (parsed && parsed.clave) {
          return { clave: parsed.clave, autenticado: true };
        }
      }
    } catch {}
  }

  // 3. Si no hay ticket ni sesión volátil en la pestaña, el usuario NO está autenticado
  return { clave: 'carlos', autenticado: false };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState(() => resolverSesionInicial());

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alojate_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

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
    // 1. Purgar la sesión volátil de la pestaña
    try {
      sessionStorage.removeItem('alojate_sso_session');
      sessionStorage.clear();
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
      localStorage.removeItem('alojate_mis_reservas');
    } catch {}

    setAuthData({ clave: 'carlos', autenticado: false });

    // 2. Single Logout (SLO): Redirigir al portal central (:3000) ordenando revocar la sesión global
    window.location.href = 'http://localhost:3000/?sso_logout=true#/catalogo';
  };

  return (
    <AuthContext.Provider
      value={{
        perfil: PERFILES_ANFITRION[authData.clave],
        anfitrionClave: authData.clave,
        isAuthenticated: authData.autenticado,
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
