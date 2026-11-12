import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerfilAnfitrion } from '../types/anfitrion.types';
import { setSSOToken } from '../api/httpClient';
import { API_BASE_URL, CLIENTES_URL } from '../api/apiEndpoints';

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
    saldoDisponible: 'Bs. 0',
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
      ingresosNetos: 'Bs. 0',
      tasaOcupacion: '0%',
      huespedesActivos: '0 Activos',
      reputacion: '5.0 ★'
    }
  }
};

interface AuthContextType {
  perfil: PerfilAnfitrion;
  anfitrionClave: string;
  isAuthenticated: boolean;
  cargandoSSO: boolean;
  rolNoPermitido: 'CLIENTE' | 'ADMINISTRADOR' | null;
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
      const em = (urlEmail || '').toLowerCase();
      if (em.includes('anfitrion') || em.includes('carlos')) return 'carlos';
      if (em) return em.split('@')[0];

      const ssoRaw = sessionStorage.getItem('alojate_sso_anfitrion');
      if (ssoRaw) {
        const parsed = JSON.parse(ssoRaw);
        if (parsed.clave) return parsed.clave;
      }
      const saved = localStorage.getItem('alojate_anfitrion_clave');
      if (saved) return saved;
    } catch {}
    return 'carlos';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cargandoSSO, setCargandoSSO] = useState<boolean>(true);
  const [rolNoPermitido, setRolNoPermitido] = useState<'CLIENTE' | 'ADMINISTRADOR' | null>(null);

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
      await fetch(`${API_BASE_URL}/api/v1/usuarios/por-email/cuenta-bancaria?email=${encodeURIComponent(perfilFinal.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } catch (err) {
      console.warn('[Backend Finanzas] Error actualizando cuenta en Gateway:', err);
    }
  };

  const cargarPerfilDesdeBackend = async (email: string): Promise<Partial<PerfilAnfitrion> | null> => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/usuarios/por-email?email=${encodeURIComponent(email)}`);
      if (resp.ok) {
        const u = await resp.json();
        return {
          id: u.idUsuario || u.id,
          nombre: u.nombre ? `${u.nombre} ${u.apellido || ''}`.trim() : undefined,
          email: u.email || email,
          telefono: u.telefono || '',
          ciNumero: u.ci || u.ciNumero || '',
          ciExpedido: u.ciExpedido || 'LP',
          bancoNombre: u.bancoNombre || '',
          numeroCuentaBancaria: u.numeroCuentaBancaria || '',
          qr: u.qr || '',
          ciudad: u.ciudad || 'La Paz',
          departamento: u.departamento || 'La Paz',
          cuentaBNB: u.bancoNombre ? `Titular: ${u.nombre} ${u.apellido || ''} • ${u.bancoNombre} Cta: ${u.numeroCuentaBancaria || ''}` : '',
          estadoVerificacion: u.estado === 'VERIFICADO' ? 'VERIFICADO' : 'PENDIENTE_REVISION',
          verificado: u.estado === 'VERIFICADO'
        };
      }
    } catch (err) {
      console.warn('[AuthContext] No se pudo cargar perfil de MS-01:', err);
    }
    return null;
  };

  const perfilBase: PerfilAnfitrion = PERFILES_ANFITRION[anfitrionClave] || {
    id: anfitrionClave.includes('daniel') ? '7c772f61-90f1-474a-8acf-e7ba66e20d40' : `anf-${anfitrionClave}`,
    nombre: perfilPersonalizado.nombre || (anfitrionClave.includes('daniel') ? 'Daniel Quispe' : 'Anfitrión Registrado'),
    email: perfilPersonalizado.email || (anfitrionClave.includes('daniel') ? 'danielqc333@gmail.com' : `${anfitrionClave}@alojate.bo`),
    telefono: perfilPersonalizado.telefono || '',
    ciudad: perfilPersonalizado.ciudad || 'La Paz',
    departamento: perfilPersonalizado.departamento || 'La Paz',
    descripcion: perfilPersonalizado.descripcion || 'Anfitrión registrado en la plataforma oficial de Aloja-Te Bolivia.',
    avatarUrl: perfilPersonalizado.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    cuentaBNB: perfilPersonalizado.cuentaBNB || '',
    bancoNombre: perfilPersonalizado.bancoNombre || '',
    numeroCuentaBancaria: perfilPersonalizado.numeroCuentaBancaria || '',
    qr: perfilPersonalizado.qr || '',
    ciNumero: perfilPersonalizado.ciNumero || '',
    ciExpedido: perfilPersonalizado.ciExpedido || 'LP',
    saldoDisponible: 'Bs. 0',
    verificado: perfilPersonalizado.verificado ?? false,
    estadoVerificacion: perfilPersonalizado.estadoVerificacion || 'PENDIENTE_REVISION',
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

  const consultarSesionCentralSSO = async () => {
    setCargandoSSO(true);
    setRolNoPermitido(null);

    // 1. Verificar si viene con parámetros SSO en la URL o Hash
    try {
      const searchStr = window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
      const searchParams = new URLSearchParams(searchStr);
      const urlEmail = searchParams.get('sso_email') || searchParams.get('email');
      const urlToken = searchParams.get('sso_token') || searchParams.get('token');
      const urlNombre = searchParams.get('sso_nombre') || searchParams.get('nombre');
      const urlRol = (searchParams.get('sso_rol') || searchParams.get('rol') || '').toUpperCase();

      // Limpiar URL de inmediato para jamás dejar tokens ni roles expuestos en la barra de direcciones
      if (searchStr && (urlEmail || urlToken || urlRol || urlNombre)) {
        const cleanHash = window.location.hash.includes('?') ? window.location.hash.split('?')[0] : window.location.hash;
        window.history.replaceState({}, document.title, window.location.pathname + (cleanHash || '#/dashboard'));
      }

      if (urlRol === 'CLIENTE') {
        setIsAuthenticated(false);
        setRolNoPermitido('CLIENTE');
        setCargandoSSO(false);
        return;
      }
      if (urlRol === 'ADMINISTRADOR' || urlRol === 'ADMIN') {
        setIsAuthenticated(false);
        setRolNoPermitido('ADMINISTRADOR');
        setCargandoSSO(false);
        return;
      }

      if (urlEmail || urlToken) {
        const em = (urlEmail || '').toLowerCase();
        const clave = (em.includes('anfitrion') || em.includes('carlos')) ? 'carlos' : (em ? em.split('@')[0] : 'carlos');
        
        sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave, email: urlEmail, nombre: urlNombre, token: urlToken, rol: 'ANFITRION' }));
        localStorage.setItem('alojate_anfitrion_clave', clave);
        if (urlToken) {
          localStorage.setItem('alojate_anfitrion_token', urlToken);
          localStorage.setItem('alojate_jwt_token', urlToken);
        }
        if (urlEmail) {
          localStorage.setItem('alojate_anfitrion_email', urlEmail);
        }

        setAnfitrionClave(clave);
        setRolNoPermitido(null);
        setIsAuthenticated(true);
        if (urlToken) setSSOToken(urlToken);
        setCargandoSSO(false);

        // Cargar perfil real desde MS-01 para este usuario
        if (urlEmail) {
          const perfilBd = await cargarPerfilDesdeBackend(urlEmail);
          if (perfilBd) {
            actualizarPerfil(perfilBd);
          }
        }
        return;
      }
    } catch {}

    // 2. Consultar Gateway API validando el token persistente del navegador o sesión central
    try {
      let tokenLocal: string | null = null;
      let emailLocal: string | null = null;
      try {
        const ssoRaw = sessionStorage.getItem('alojate_sso_anfitrion');
        if (ssoRaw) {
          const parsed = JSON.parse(ssoRaw);
          tokenLocal = parsed.token;
          emailLocal = parsed.email;
        }
      } catch {}

      if (!tokenLocal) {
        tokenLocal = localStorage.getItem('alojate_anfitrion_token') || localStorage.getItem('alojate_jwt_token');
      }
      if (!emailLocal) {
        emailLocal = localStorage.getItem('alojate_anfitrion_email');
      }

      const headers: Record<string, string> = tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {};
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/sso/session`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        if (data.authenticated && data.usuario) {
          const rol = String(data.usuario.rol || '').toUpperCase();
          if (rol === 'CLIENTE') {
            setIsAuthenticated(false);
            setRolNoPermitido('CLIENTE');
            setCargandoSSO(false);
            return;
          }
          if (rol === 'ADMINISTRADOR' || rol === 'ADMIN') {
            setIsAuthenticated(false);
            setRolNoPermitido('ADMINISTRADOR');
            setCargandoSSO(false);
            return;
          }

          if (rol === 'ANFITRION') {
            const email = (data.usuario.email || '').toLowerCase();
            const clave = (email.includes('anfitrion') || email.includes('carlos')) ? 'carlos' : (email ? email.split('@')[0] : 'carlos');
            
            sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave, email: data.usuario.email, nombre: data.usuario.nombre, token: data.token, rol: 'ANFITRION' }));
            localStorage.setItem('alojate_anfitrion_clave', clave);
            if (data.token) {
              localStorage.setItem('alojate_anfitrion_token', data.token);
              localStorage.setItem('alojate_jwt_token', data.token);
            }
            if (data.usuario.email) {
              localStorage.setItem('alojate_anfitrion_email', data.usuario.email);
            }

            setAnfitrionClave(clave);

            // Cargar datos completos desde MS-01 para tener teléfono, CI, banco, etc.
            const perfilBd = await cargarPerfilDesdeBackend(data.usuario.email);
            const datosCombinados: Partial<PerfilAnfitrion> = {
              id: data.usuario.id || perfilBd?.id,
              nombre: data.usuario.nombre ? `${data.usuario.nombre} ${data.usuario.apellido || ''}`.trim() : perfilBd?.nombre,
              email: data.usuario.email || perfilBd?.email,
              telefono: data.usuario.telefono || perfilBd?.telefono || '',
              ciNumero: data.usuario.ci || data.usuario.ciNumero || perfilBd?.ciNumero || '',
              ciExpedido: data.usuario.ciExpedido || perfilBd?.ciExpedido || 'LP',
              bancoNombre: data.usuario.bancoNombre || perfilBd?.bancoNombre || '',
              numeroCuentaBancaria: data.usuario.numeroCuentaBancaria || perfilBd?.numeroCuentaBancaria || '',
              qr: data.usuario.qr || perfilBd?.qr || '',
              ciudad: data.usuario.ciudad || perfilBd?.ciudad || 'La Paz',
              departamento: data.usuario.departamento || perfilBd?.departamento || 'La Paz',
              verificado: perfilBd?.verificado ?? false,
              estadoVerificacion: perfilBd?.estadoVerificacion || 'PENDIENTE_REVISION'
            };
            actualizarPerfil(datosCombinados);

            setRolNoPermitido(null);
            setIsAuthenticated(true);
            setSSOToken(data.token || null);
            setCargandoSSO(false);
            return;
          }
        }
      }

      // Si el Gateway devolvió no autenticado pero tenemos anfitrión guardado en localStorage
      if (emailLocal && (emailLocal.includes('anfitrion') || emailLocal.includes('carlos') || emailLocal.includes('daniel'))) {
        const perfilBd = await cargarPerfilDesdeBackend(emailLocal);
        if (perfilBd) {
          actualizarPerfil(perfilBd);
          setRolNoPermitido(null);
          setIsAuthenticated(true);
          setCargandoSSO(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[SSO Anfitrión] Error al conectar con Gateway central:', err);
    }

    setRolNoPermitido(null);
    setIsAuthenticated(false);
    setCargandoSSO(false);
  };

  useEffect(() => {
    consultarSesionCentralSSO();
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

  const loginDemo = async (clave: string = 'carlos') => {
    let email = `${clave}@alojate.bo`;
    if (clave === 'daniel') email = 'danielqc333@gmail.com';
    else if (clave === 'carlos') email = 'anfitrion@alojate.bo';

    sessionStorage.setItem('alojate_sso_anfitrion', JSON.stringify({ clave, email, rol: 'ANFITRION' }));
    localStorage.setItem('alojate_anfitrion_clave', clave);
    setAnfitrionClave(clave);
    setRolNoPermitido(null);
    setIsAuthenticated(true);
    setCargandoSSO(false);

    const perfilBackend = await cargarPerfilDesdeBackend(email);
    if (perfilBackend) {
      actualizarPerfil(perfilBackend);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/sso/logout`, { method: 'POST' });
    } catch {}

    sessionStorage.removeItem('alojate_sso_anfitrion');
    localStorage.removeItem('alojate_anfitrion_clave');
    localStorage.removeItem('alojate_anfitrion_token');
    localStorage.removeItem('alojate_jwt_token');
    localStorage.removeItem('alojate_anfitrion_email');
    localStorage.removeItem('alojate_anfitrion_perfil_custom');
    setRolNoPermitido(null);
    setIsAuthenticated(false);
    setSSOToken(null);

    window.location.href = `${CLIENTES_URL}/#/catalogo`;
  };

  return (
    <AuthContext.Provider
      value={{
        perfil: perfilFinal,
        anfitrionClave,
        isAuthenticated,
        cargandoSSO,
        rolNoPermitido,
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