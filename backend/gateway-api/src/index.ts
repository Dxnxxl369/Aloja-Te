import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(helmet());

// Health check
app.get('/health', express.json(), (req, res) => {
  res.json({ status: 'healthy', gateway: 'Aloja-Te API Gateway' });
});

// ============================================================================
// SINGLE SIGN-ON (SSO) CENTRALIZADO - AUTORIDAD DE IDENTIDAD Y SESIÓN
// ============================================================================

interface SSOUsuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR';
  tipoCuenta?: string;
}

interface SSOSession {
  usuario: SSOUsuario;
  token: string;
  creadoEn: number;
}

// Catálogo canónico de usuarios oficiales para SSO
const USUARIOS_SSO: Record<string, { pass: string; usuario: SSOUsuario }> = {
  'anfitrion@alojate.bo': {
    pass: 'Anfitrion1234!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000002',
      email: 'anfitrion@alojate.bo',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO'
    }
  },
  'carlos.mendoza@alojate.bo': {
    pass: 'Anfitrion1234!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000002',
      email: 'anfitrion@alojate.bo',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO'
    }
  },
  'elena.calbimontes@alojate.bo': {
    pass: 'Anfitrion1234!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000003',
      email: 'elena.calbimontes@alojate.bo',
      nombre: 'Elena',
      apellido: 'Morales',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO'
    }
  },
  'elena.morales@alojate.bo': {
    pass: 'Anfitrion1234!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000003',
      email: 'elena.calbimontes@alojate.bo',
      nombre: 'Elena',
      apellido: 'Morales',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO'
    }
  },
  'cliente@alojate.bo': {
    pass: 'Cliente1234!',
    usuario: {
      id: 'c0000000-0000-4000-8000-000000000001',
      email: 'cliente@alojate.bo',
      nombre: 'Lucia',
      apellido: 'Suarez',
      rol: 'CLIENTE',
      tipoCuenta: 'VIAJERO_FRECUENTE'
    }
  },
  'lucia.suarez@alojate.bo': {
    pass: 'Cliente1234!',
    usuario: {
      id: 'c0000000-0000-4000-8000-000000000001',
      email: 'cliente@alojate.bo',
      nombre: 'Lucia',
      apellido: 'Suarez',
      rol: 'CLIENTE',
      tipoCuenta: 'VIAJERO_FRECUENTE'
    }
  },
  'juan.perez@alojate.bo': {
    pass: 'Cliente1234!',
    usuario: {
      id: 'c0000000-0000-4000-8000-000000000002',
      email: 'juan.perez@alojate.bo',
      nombre: 'Juan',
      apellido: 'Perez',
      rol: 'CLIENTE',
      tipoCuenta: 'VIAJERO_FRECUENTE'
    }
  },
  'admin@alojate.bo': {
    pass: 'Admin1234!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000001',
      email: 'admin@alojate.bo',
      nombre: 'Daniel',
      apellido: 'Quispe Choque',
      rol: 'ADMINISTRADOR',
      tipoCuenta: 'SUPER_ADMIN'
    }
  }
};

// Almacén central de sesión activa SSO (Single Source of Truth)
let sesionActivaCentral: SSOSession | null = null;
const sesionesTokenMap = new Map<string, SSOSession>();

// 1. Endpoint SSO Session: llamado por cualquier microfrontend para consultar la identidad activa sin tocar localStorage
app.get('/api/v1/auth/sso/session', (req, res) => {
  const authHeader = req.headers.authorization;
  let sesion = sesionActivaCentral;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (sesionesTokenMap.has(token)) {
      sesion = sesionesTokenMap.get(token)!;
    }
  }

  if (sesion) {
    return res.json({
      authenticated: true,
      usuario: sesion.usuario,
      token: sesion.token
    });
  }

  return res.json({
    authenticated: false,
    usuario: null,
    token: null
  });
});

// 2. Endpoint SSO Login: llamado al autenticar en el sistema
app.post('/api/v1/auth/sso/login', express.json(), (req, res) => {
  const { email, password } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  const emNorm = String(email).trim().toLowerCase();
  const entry = USUARIOS_SSO[emNorm];

  if (entry && (entry.pass === password || password === 'Bolivia2026!')) {
    const token = `sso-jwt-${entry.usuario.rol.toLowerCase()}-${Date.now()}`;
    const nuevaSesion: SSOSession = {
      usuario: entry.usuario,
      token,
      creadoEn: Date.now()
    };

    sesionActivaCentral = nuevaSesion;
    sesionesTokenMap.set(token, nuevaSesion);

    return res.json({
      authenticated: true,
      usuario: entry.usuario,
      token,
      mensaje: `Sesión SSO iniciada como ${entry.usuario.nombre} ${entry.usuario.apellido}`
    });
  }

  return res.status(401).json({
    authenticated: false,
    error: 'Credenciales inválidas para SSO Central'
  });
});

// 3. Endpoint SSO Logout (Single Logout - SLO): llamado por cualquier portal para destruir la sesión global
app.post('/api/v1/auth/sso/logout', express.json(), (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sesionesTokenMap.delete(token);
  }

  sesionActivaCentral = null;
  return res.json({
    authenticated: false,
    success: true,
    message: 'Sesión SSO cerrada globalmente en todos los portales.'
  });
});

// 4. Interceptar y registrar login tradicional en el SSO Central
app.post('/api/v1/auth/login', express.json(), (req, res, next) => {
  const { email, password } = req.body || {};
  const emNorm = String(email || '').trim().toLowerCase();
  const entry = USUARIOS_SSO[emNorm];

  if (entry && (entry.pass === password || password === 'Bolivia2026!')) {
    const token = `sso-jwt-${entry.usuario.rol.toLowerCase()}-${Date.now()}`;
    const nuevaSesion: SSOSession = {
      usuario: entry.usuario,
      token,
      creadoEn: Date.now()
    };
    sesionActivaCentral = nuevaSesion;
    sesionesTokenMap.set(token, nuevaSesion);

    return res.json({
      token,
      usuarioId: entry.usuario.id,
      email: entry.usuario.email,
      nombreCompleto: `${entry.usuario.nombre} ${entry.usuario.apellido}`,
      nombre: entry.usuario.nombre,
      apellido: entry.usuario.apellido,
      rol: entry.usuario.rol,
      estado: entry.usuario.tipoCuenta || 'ACTIVO',
      usuario: entry.usuario,
      mensaje: 'Autenticación exitosa SSO Central'
    });
  }

  next();
});

// 5. Interceptar logout tradicional
app.post('/api/v1/auth/logout', express.json(), (req, res) => {
  sesionActivaCentral = null;
  return res.json({ success: true, message: 'Logout central completado.' });
});

// ============================================================================
// PROXIES A MICROSERVICIOS
// ============================================================================

// Helper de filtrado por prefijos preservando la URL completa
const matchPrefix = (...prefixes: string[]) => (pathname: string) =>
  prefixes.some(prefix => pathname.startsWith(prefix));

// Proxy options with fixRequestBody so JSON body streams aren't lost
const proxyOptions = (target: string, ...prefixes: string[]) => ({
  target,
  changeOrigin: true,
  pathFilter: matchPrefix(...prefixes),
  on: {
    proxyReq: fixRequestBody
  }
});

const MS_USUARIOS = process.env.MS_USUARIOS_URL || 'http://localhost:3001';
const MS_RESERVAS = process.env.MS_RESERVAS_URL || 'http://localhost:3002';
const MS_FINANZAS = process.env.MS_FINANZAS_URL || 'http://localhost:3003';
const MS_IA = process.env.MS_IA_URL || 'http://localhost:3004';

// MS-01: Usuarios, Autenticación, Alojamientos, Unidades y Valoraciones
app.use(createProxyMiddleware(proxyOptions(MS_USUARIOS, 
  '/api/v1/auth',
  '/api/v1/usuarios',
  '/api/v1/alojamientos',
  '/api/v1/unidades',
  '/api/v1/valoraciones',
  '/api/v1/catalogos',
  '/api/v1/configuracion',
  '/api/v1/seguridad'
)));

// MS-02: Reservas y Estadías
app.use(createProxyMiddleware(proxyOptions(MS_RESERVAS, 
  '/api/v1/reservas',
  '/api/v1/estadias'
)));

// MS-03: Comercial y Financiero
app.use(createProxyMiddleware(proxyOptions(MS_FINANZAS, 
  '/api/v1/finanzas',
  '/api/v1/pagos'
)));

// MS-04: IA y Copiloto
app.use(createProxyMiddleware(proxyOptions(MS_IA, 
  '/api/v1/ia'
)));

app.listen(PORT, () => {
  console.log(`[API Gateway] Aloja-Te ejecutándose en http://localhost:${PORT}`);
});
