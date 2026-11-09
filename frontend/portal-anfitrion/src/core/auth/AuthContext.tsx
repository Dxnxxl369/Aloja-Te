import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerfilAnfitrion } from '../types/anfitrion.types';
import { setSSOToken } from '../api/httpClient';

export const PERFILES_ANFITRION: Record<string, PerfilAnfitrion> = {
  carlos: {
    id: 'a0000000-0000-4000-8000-000000000002',
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
    id: 'a0000000-0000-4000-8000-000000000003',
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
  },
  daniel: {
    id: 'a0000000-0000-4000-8000-000000000004',
    nombre: 'Daniel Quispe',
    email: 'danielqczn@gmail.com',
    telefono: '63591455',
    ciudad: 'Santa Cruz',
    departamento: 'Santa Cruz',
    descripcion: 'Anfitrión verificado en Santa Cruz de la Sierra y toda Bolivia. Alojamientos residenciales y hoteleros con altos estándares.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    cuentaBNB: 'Titular: Daniel Quispe • Cuenta: 4010987654321',
    bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
    numeroCuentaBancaria: '4010987654321',
    qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-daniel-quispe.png',
    saldoDisponible: 'Bs. 7,500',
    verificado: true,
    ciNumero: '6359145',
    ciExpedido: 'SC',
    ciAnversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    ciReversoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    nit: '6359145019',
    licenciaTuristica: 'LIC-TUR-SCZ-2026-001',
    comprobanteDomicilioUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    estadoVerificacion: 'VERIFICADO',
    kpis: {
      ingresosNetos: 'Bs. 21,400',
      tasaOcupacion: '92.0%',
      huespedesActivos: '3 Activos',
      reputacion: '5.0 ★'
    }
  }
};

interface AuthContextType {
  perfil: PerfilAnfitrion;
  anfitrionClave: string;
  isAuthenticated: boolean;
  cargandoSSO: boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  actualizarPerfil: (datosNuevos: Partial<PerfilAnfitrion>) => void;
  actualizarDatosBancariosBackend: (datos: { bancoNombre: string; numeroCuentaBancaria: string; qr: string }) => Promise<void>;
  consultarSesionCentralSSO: () => Promise<void>;
  loginDemo: (clave?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anfitrionClave, setAnfitrionClave] = useState<string>(() => {
    try {
      const searchStr = window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
      const searchParams = new URLSearchParams(searchStr);
      const urlEmail = searchParams.get('sso_email') || searchParams.get('email');
      const urlNombre = searchParams.get('sso_nombre') || searchParams.get('nombre');
      const em = (urlEmail || '').toLowerCase();
      const nom = (urlNombre || '').toLowerCase();
      if (em.includes('daniel') || nom.includes('daniel')) return 'daniel';
      if (em.includes('elena') || nom.includes('elena')) return 'elena';
      if (em.includes('carlos') || nom.includes('carlos')) return 'carlos';
      if (em) return em.split('@')[0];

      const ssoRaw = sessionStorage.getItem('alojate_sso_anfitrion');
      if (ssoRaw) {
        const parsed = JSON.parse(ssoRaw);
        if (parsed.clave) return parsed.clave;
      }
      const saved = localStorage.getItem('alojate_anfitrion_clave');
      if (saved) return saved;
    } catch {}
    return 'daniel';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [cargandoSSO, setCargandoSSO] = useState<boolean>(false);

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

  const perfilBase: PerfilAnfitrion = PERFILES_ANFITRION[anfitrionClave] || {
    id: `anf-${anfitrionClave}`,
    nombre: perfilPersonalizado.nombre || 'Anfitrión Registrado',
    email: perfilPersonalizado.email || `${anfitrionClave}@alojate.bo`,
    telefono: '+591 70000000',
    ciudad: 'Santa Cruz',
    departamento: 'Santa Cruz',
    descripcion: 'Anfitrión verificado en la plataforma oficial de Aloja-Te Bolivia.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    cuentaBNB: 'Titular Registrado',
    saldoDisponible: 'Bs. 0',
    verificado: true,
    estadoVerificacion: 'VERIFICADO',
    kpis: {
      ingresosNetos: 'Bs. 0',
      tasaOcupacion: '0%',
      huespedesActivos: '0 Activos',
      reputacion: '5.0 ★'
    }
  };

  const perfilFinal: PerfilAnfitrion = {
    ...perfilBase,
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
    // 1. Verificar si viene con parámetros SSO en la URL o Hash
    try {
      const searchStr = window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
      const searchParams = new URLSearchParams(searchStr);
      const urlEmail = searchParams.get('sso_email') || searchParams.get('email');
      const urlToken = searchParams.get('sso_token') || searchParams.get('token');
      const urlNombre = searchParams.get('sso_nombre') || searchParams.get('nombre');

      if (urlEmail || urlToken) {
        const em = (urlEmail || '').toLowerCase();
        const nom = (urlNombre || '').toLowerCase();
        const clave: 'carlos' | 'elena' | 'daniel' = (em.includes('daniel') || nom.includes('daniel'))
          ? 'daniel'
          : ((em.includes('elena') || nom.includes('elena')) ? 'elena' : 'carlos');
        
        sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave, email: urlEmail, nombre: urlNombre, token: urlToken }));
        localStorage.setItem('alojate_anfitrion_clave', clave);

        setAnfitrionClave(clave);
        setIsAuthenticated(true);
        if (urlToken) setSSOToken(urlToken);
        setCargandoSSO(false);

        // Limpiar URL preservando el hash de navegación
        const cleanHash = window.location.hash.includes('?') ? window.location.hash.split('?')[0] : window.location.hash;
        window.history.replaceState({}, document.title, window.location.pathname + (cleanHash || '#/dashboard'));
        return;
      }
    } catch {}

    // 2. Consultar Gateway API Central de SSO
    try {
      let tokenLocal: string | null = null;
      try {
        const ssoRaw = sessionStorage.getItem('alojate_sso_anfitrion');
        if (ssoRaw) tokenLocal = JSON.parse(ssoRaw).token;
      } catch {}

      const headers: Record<string, string> = tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {};
      const resp = await fetch('http://localhost:8080/api/v1/auth/sso/session', { headers });
      if (resp.ok) {
        const data = await resp.json();
        if (data.authenticated && data.usuario) {
          const email = (data.usuario.email || '').toLowerCase();
          const nombre = (data.usuario.nombre || '').toLowerCase();
          const clave: 'carlos' | 'elena' | 'daniel' = (email.includes('daniel') || nombre.includes('daniel'))
            ? 'daniel'
            : ((email.includes('elena') || nombre.includes('elena')) ? 'elena' : 'carlos');
          
          sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave, email: data.usuario.email, nombre: data.usuario.nombre, token: data.token }));
          localStorage.setItem('alojate_anfitrion_clave', clave);

          setAnfitrionClave(clave);
          if (data.usuario.id) {
            actualizarPerfil({
              id: data.usuario.id,
              nombre: data.usuario.nombre ? `${data.usuario.nombre} ${data.usuario.apellido || ''}`.trim() : undefined,
              email: data.usuario.email,
              bancoNombre: data.usuario.bancoNombre,
              numeroCuentaBancaria: data.usuario.numeroCuentaBancaria,
              qr: data.usuario.qr
            });
          }
          setIsAuthenticated(true);
          setSSOToken(data.token || null);
          setCargandoSSO(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[SSO Anfitrión] Error al conectar con Gateway central:', err);
    }

    // 3. Fallback en caso de prueba directa local o recarga de pestaña
    try {
      const demoUserRaw = sessionStorage.getItem('alojate_sso_anfitrion');
      if (demoUserRaw) {
        const demo = JSON.parse(demoUserRaw);
        setAnfitrionClave(demo.clave || 'daniel');
        setIsAuthenticated(true);
        if (demo.token) setSSOToken(demo.token);
        setCargandoSSO(false);
        return;
      }
      const savedClave = localStorage.getItem('alojate_anfitrion_clave') as 'carlos' | 'elena' | 'daniel' | null;
      if (savedClave && ['carlos', 'elena', 'daniel'].includes(savedClave)) {
        setAnfitrionClave(savedClave);
        setIsAuthenticated(true);
        setCargandoSSO(false);
        return;
      }
    } catch {}

    // En el portal anfitrión dedicado, mantener la sesión activa con acceso verificado
    setIsAuthenticated(true);
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

  const loginDemo = (clave: string = 'daniel') => {
    sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave }));
    localStorage.setItem('alojate_anfitrion_clave', clave);
    setAnfitrionClave(clave);
    setIsAuthenticated(true);
    setCargandoSSO(false);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/v1/auth/sso/logout', { method: 'POST' });
    } catch {}

    sessionStorage.removeItem('alojate_sso_anfitrion');
    localStorage.removeItem('alojate_anfitrion_clave');
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