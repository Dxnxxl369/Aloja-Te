import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerfilAnfitrion } from '../types/anfitrion.types';
import { setSSOToken } from '../api/httpClient';

export const PERFILES_ANFITRION: Record<string, PerfilAnfitrion> = {
  carlos: {
    id: 'carlos-mendoza-scz',
    nombre: 'Carlos Mendoza Cuéllar',
    email: 'anfitrion@alojate.bo',
    telefono: '+591 77012345',
    ciudad: 'Santa Cruz',
    departamento: 'Santa Cruz',
    descripcion: 'Operador de hospedajes coloniales y rústicos en el departamento de Santa Cruz. Documentación legal y cuenta bancaria acreditada al 100%.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cuentaBNB: 'Titular: Carlos Mendoza Cuéllar • Caja de Ahorro: 150-0892341-01',
    bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
    numeroCuentaBancaria: '4010987654321',
    qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-carlos-mendoza.png',
    saldoDisponible: 'Bs. 3,420',
    verificado: true,
    ciNumero: '5829104',
    ciExpedido: 'SC',
    ciAnversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    ciReversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    nit: '5829104018',
    licenciaTuristica: 'LIC-TUR-SCZ-2024-089',
    comprobanteDomicilioUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    estadoVerificacion: 'VERIFICADO',
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
    telefono: '+591 71298765',
    ciudad: 'Tarija',
    departamento: 'Tarija',
    descripcion: 'Operadora de turismo vitivinícola en el Valle Central de Tarija y residencias de altura en La Paz. Calificación de excelencia turística.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    cuentaBNB: 'Titular: Elena Morales Calbimontes • Caja de Ahorro: 150-0439120-02',
    bancoNombre: 'Banco Nacional de Bolivia S.A. (BNB)',
    numeroCuentaBancaria: '2000492817402',
    qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-elena-morales.png',
    saldoDisponible: 'Bs. 5,180',
    verificado: true,
    ciNumero: '4892103',
    ciExpedido: 'TJ',
    ciAnversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    ciReversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    nit: '4892103012',
    licenciaTuristica: 'LIC-TUR-TRJ-2024-042',
    comprobanteDomicilioUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    estadoVerificacion: 'VERIFICADO',
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
  actualizarPerfil: (datosNuevos: Partial<PerfilAnfitrion>) => void;
  actualizarDatosBancariosBackend: (datos: { bancoNombre: string; numeroCuentaBancaria: string; qr: string }) => Promise<void>;
  consultarSesionCentralSSO: () => Promise<void>;
  loginDemo: (clave?: 'carlos' | 'elena') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anfitrionClave, setAnfitrionClave] = useState<'carlos' | 'elena'>('carlos');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cargandoSSO, setCargandoSSO] = useState<boolean>(true);

  const [perfilPersonalizado, setPerfilPersonalizado] = useState<Partial<PerfilAnfitrion>>(() => {
    try {
      const saved = localStorage.getItem('alojate_anfitrion_perfil_custom');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alojate_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const actualizarPerfil = (datosNuevos: Partial<PerfilAnfitrion>) => {
    setPerfilPersonalizado(prev => {
      const updated = { ...prev, ...datosNuevos };
      localStorage.setItem('alojate_anfitrion_perfil_custom', JSON.stringify(updated));
      return updated;
    });
  };

  const actualizarDatosBancariosBackend = async (datos: { bancoNombre: string; numeroCuentaBancaria: string; qr: string }) => {
    actualizarPerfil(datos);
    try {
      await fetch(`http://localhost:8080/api/v1/usuarios/por-email/cuenta-bancaria?email=${encodeURIComponent(perfilFinal.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } catch (err) {
      console.warn('[Backend Finanzas] Error actualizando cuenta en Gateway:', err);
    }
  };

  const perfilFinal: PerfilAnfitrion = {
    ...PERFILES_ANFITRION[anfitrionClave],
    ...perfilPersonalizado
  };

  // Limpieza defensiva de cualquier residuo previo en localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('alojate_jwt_token');
      localStorage.removeItem('alojate_user_profile');
      sessionStorage.removeItem('alojate_sso_session');
    } catch {}
  }, []);

  const consultarSesionCentralSSO = async () => {
    // 1. Verificar si viene con parámetros SSO en la URL
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlEmail = searchParams.get('sso_email') || searchParams.get('email');
      const urlToken = searchParams.get('sso_token') || searchParams.get('token');
      const urlNombre = searchParams.get('sso_nombre') || searchParams.get('nombre');

      if (urlEmail || urlToken) {
        const em = (urlEmail || '').toLowerCase();
        const nom = (urlNombre || '').toLowerCase();
        const clave: 'carlos' | 'elena' = (em.includes('elena') || nom.includes('elena')) ? 'elena' : 'carlos';
        setAnfitrionClave(clave);
        setIsAuthenticated(true);
        if (urlToken) setSSOToken(urlToken);
        setCargandoSSO(false);

        // Limpiar URL sin recargar
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    } catch {}

    // 2. Consultar Gateway API Central de SSO
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

    // 3. Fallback en caso de prueba directa local
    try {
      const demoUserRaw = sessionStorage.getItem('alojate_sso_anfitrion');
      if (demoUserRaw) {
        const demo = JSON.parse(demoUserRaw);
        setAnfitrionClave(demo.clave || 'carlos');
        setIsAuthenticated(true);
        setCargandoSSO(false);
        return;
      }
    } catch {}

    setIsAuthenticated(false);
    setSSOToken(null);
    setCargandoSSO(false);
  };

  useEffect(() => {
    consultarSesionCentralSSO();

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

  const loginDemo = (clave: 'carlos' | 'elena' = 'carlos') => {
    sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave }));
    setAnfitrionClave(clave);
    setIsAuthenticated(true);
    setCargandoSSO(false);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/v1/auth/sso/logout', { method: 'POST' });
    } catch {}

    sessionStorage.removeItem('alojate_sso_anfitrion');
    setIsAuthenticated(false);
    setSSOToken(null);

    window.location.href = 'http://localhost:3000/#/catalogo';
  };

  return (
    <AuthContext.Provider
      value={{
        perfil: perfilFinal,
        anfitrionClave,
        isAuthenticated,
        cargandoSSO,
        logout,
        darkMode,
        toggleDarkMode,
        actualizarPerfil,
        actualizarDatosBancariosBackend,
        consultarSesionCentralSSO,
        loginDemo
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