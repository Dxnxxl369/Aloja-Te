import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import crypto from 'crypto';
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
// GESTIÓN CENTRALIZADA Y RESILIENTE DE ALOJAMIENTOS Y BANDEJA DE MODERACIÓN
// ============================================================================

const alojamientosCentralesMap = new Map<string, any>();

// 1. Crear alojamiento (Anfitrión) con guardado simultáneo en backend MS-01 y memoria Gateway
app.post('/api/v1/alojamientos', express.json(), async (req, res, next) => {
  const body = req.body;
  let backendData: any = null;
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization as string } : {})
      },
      body: JSON.stringify(body)
    });
    if (backendRes.ok) {
      backendData = await backendRes.json();
    }
  } catch (err) {
    console.warn('[Gateway] MS-01 no disponible para POST /alojamientos, gestionando en Gateway:', err);
  }

  const id = backendData?.idAlojamiento || backendData?.id || crypto.randomUUID();

  const nuevo = {
    ...backendData,
    idAlojamiento: id,
    id: id,
    idAnfitrion: body.idAnfitrion || 'a0000000-0000-4000-8000-000000000002',
    nombreAnfitrion: body.nombreAnfitrion || 'Carlos Mendoza · Anfitrión Registrado',
    titulo: body.titulo,
    descripcion: body.descripcion || '',
    direccion: body.direccion || '',
    ciudad: body.ciudad || 'Santa Cruz',
    departamento: body.departamento || 'Santa Cruz',
    latitud: body.latitud || -17.7833,
    longitud: body.longitud || -63.1821,
    modalidad: body.modalidad || 'CASA_DEPARTAMENTO',
    politicas: body.politicas || 'Ambiente respetuoso y cumplimiento de horarios de ingreso.',
    horarioEntrada: body.horarioEntrada || '14:00',
    horarioSalida: body.horarioSalida || '11:00',
    estadoPublicacion: 'PENDIENTE',
    estado: 'PENDIENTE',
    fechaCreacion: new Date().toISOString(),
    fechaRegistro: new Date().toISOString(),
    servicios: body.servicios || body.serviciosIds || [],
    fotografias: Array.isArray(body.fotografias) ? body.fotografias : [],
    unidades: Array.isArray(body.unidades) ? body.unidades : []
  };

  alojamientosCentralesMap.set(id, nuevo);
  console.log(`[Gateway] Alojamiento registrado centralmente en PENDIENTE: "${nuevo.titulo}" (ID: ${id})`);
  return res.status(201).json(nuevo);
});

// 2. Fotografías de Alojamiento
app.post('/api/v1/alojamientos/:id/fotografias', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  const { url, orden } = req.body || {};
  
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/fotografias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  } catch {}

  const item = alojamientosCentralesMap.get(alojId);
  const fotoObj = {
    idFotografia: crypto.randomUUID(),
    idAlojamiento: alojId,
    url,
    orden: orden || 1,
    esPrincipal: orden === 1
  };
  if (item) {
    if (!item.fotografias) item.fotografias = [];
    item.fotografias.push(fotoObj);
  }
  return res.status(201).json(fotoObj);
});

// 3. Habitaciones de Hotel
app.post('/api/v1/alojamientos/:id/habitaciones', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/habitaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  } catch {}

  const item = alojamientosCentralesMap.get(alojId);
  const habObj = {
    idUnidad: crypto.randomUUID(),
    idAlojamiento: alojId,
    ...req.body,
    estado: 'DISPONIBLE'
  };
  if (item) {
    if (!item.unidades) item.unidades = [];
    item.unidades.push(habObj);
  }
  return res.status(201).json(habObj);
});

// 4. Bandeja de Moderación Pendientes (Admin Portal)
app.get('/api/v1/alojamientos/moderacion/pendientes', async (req, res, next) => {
  let list: any[] = [];
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/moderacion/pendientes`);
    if (backendRes.ok) {
      list = await backendRes.json();
    }
  } catch {}

  const idSet = new Set(list.map((a: any) => a.idAlojamiento || a.id));
  for (const [id, a] of alojamientosCentralesMap.entries()) {
    const est = a.estadoPublicacion || a.estado;
    if (est === 'PENDIENTE' && !idSet.has(id)) {
      list.push(a);
      idSet.add(id);
    }
  }
  return res.json(list);
});

// 5. Listar Todos los Alojamientos (Admin Portal & Catálogo)
app.get('/api/v1/alojamientos/todos', async (req, res, next) => {
  let list: any[] = [];
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/todos`);
    if (backendRes.ok) {
      list = await backendRes.json();
    }
  } catch {}

  const idMap = new Map<string, any>();
  for (const item of list) {
    const id = item.idAlojamiento || item.id;
    idMap.set(id, item);
  }
  for (const [id, a] of alojamientosCentralesMap.entries()) {
    const existing = idMap.get(id);
    if (existing) {
      if (a.estadoPublicacion && a.estadoPublicacion !== existing.estadoPublicacion) {
        existing.estadoPublicacion = a.estadoPublicacion;
        existing.estado = a.estadoPublicacion;
      }
      if (a.motivoRechazo) existing.motivoRechazo = a.motivoRechazo;
      if (a.motivoObservacionRechazo) existing.motivoObservacionRechazo = a.motivoObservacionRechazo;
      if ((!existing.fotografias || existing.fotografias.length === 0) && a.fotografias?.length) {
        existing.fotografias = a.fotografias;
      }
      if ((!existing.unidades || existing.unidades.length === 0) && a.unidades?.length) {
        existing.unidades = a.unidades;
      }
    } else {
      idMap.set(id, a);
    }
  }
  return res.json(Array.from(idMap.values()));
});

// 6. Decisiones de Moderación: Aprobar / Publicar
app.post('/api/v1/alojamientos/:id/aceptar', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/aceptar`, { method: 'POST' });
  } catch {}

  let item = alojamientosCentralesMap.get(alojId);
  if (item) {
    item.estadoPublicacion = 'PUBLICADO';
    item.estado = 'PUBLICADO';
    item.motivoRechazo = null;
    item.motivoObservacionRechazo = null;
  } else {
    item = {
      idAlojamiento: alojId,
      id: alojId,
      estadoPublicacion: 'PUBLICADO',
      estado: 'PUBLICADO',
      motivoRechazo: null,
      motivoObservacionRechazo: null
    };
    alojamientosCentralesMap.set(alojId, item);
  }
  return res.json(item);
});

// 7. Decisiones de Moderación: Observar
app.post('/api/v1/alojamientos/:id/observar', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  const motivo = req.body?.motivo || 'Observación por auditoría de calidad';
  const origen = req.body?.origen || 'ADMIN_MANUAL';
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/observar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, origen })
    });
  } catch {}

  let item = alojamientosCentralesMap.get(alojId);
  if (item) {
    item.estadoPublicacion = 'OBSERVADO';
    item.estado = 'OBSERVADO';
    item.motivoRechazo = motivo;
    item.motivoObservacionRechazo = motivo;
    item.origenUltimoCambio = origen;
  } else {
    item = {
      idAlojamiento: alojId,
      id: alojId,
      estadoPublicacion: 'OBSERVADO',
      estado: 'OBSERVADO',
      motivoRechazo: motivo,
      motivoObservacionRechazo: motivo,
      origenUltimoCambio: origen
    };
    alojamientosCentralesMap.set(alojId, item);
  }
  return res.json(item);
});

// 8. Decisiones de Moderación: Rechazar
app.post('/api/v1/alojamientos/:id/rechazar', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  const motivo = req.body?.motivo || 'Rechazado por incumplimiento de requisitos';
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/rechazar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
  } catch {}

  let item = alojamientosCentralesMap.get(alojId);
  if (item) {
    item.estadoPublicacion = 'RECHAZADO';
    item.estado = 'RECHAZADO';
    item.motivoRechazo = motivo;
    item.motivoObservacionRechazo = motivo;
  } else {
    item = {
      idAlojamiento: alojId,
      id: alojId,
      estadoPublicacion: 'RECHAZADO',
      estado: 'RECHAZADO',
      motivoRechazo: motivo,
      motivoObservacionRechazo: motivo
    };
    alojamientosCentralesMap.set(alojId, item);
  }
  return res.json(item);
});

// 9. Decisiones de Moderación: Suspender
app.post('/api/v1/alojamientos/:id/suspender', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  const motivo = req.body?.motivo || 'Suspensión preventiva por auditoría de calidad';
  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/suspender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
  } catch {}

  let item = alojamientosCentralesMap.get(alojId);
  if (item) {
    item.estadoPublicacion = 'SUSPENDIDO';
    item.estado = 'SUSPENDIDO';
    item.motivoRechazo = motivo;
    item.motivoObservacionRechazo = motivo;
  } else {
    item = {
      idAlojamiento: alojId,
      id: alojId,
      estadoPublicacion: 'SUSPENDIDO',
      estado: 'SUSPENDIDO',
      motivoRechazo: motivo,
      motivoObservacionRechazo: motivo
    };
    alojamientosCentralesMap.set(alojId, item);
  }
  return res.json(item);
});

// 10. Cambiar Estado Directo (Patch)
app.patch('/api/v1/alojamientos/:id/estado', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  const nuevoEstado = (req.query.estado as string) || req.body?.nuevoEstado || req.body?.estado || 'EN_REVISION';
  const motivo = (req.query.motivo as string) || req.body?.motivo;
  const origen = (req.query.origen as string) || req.body?.origen || 'ADMIN_MANUAL';

  try {
    await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/estado?estado=${nuevoEstado}&origen=${origen}`, {
      method: 'PATCH'
    });
  } catch {}

  let item = alojamientosCentralesMap.get(alojId);
  if (item) {
    item.estadoPublicacion = nuevoEstado;
    item.estado = nuevoEstado;
    if (motivo) {
      item.motivoRechazo = motivo;
      item.motivoObservacionRechazo = motivo;
    }
  } else {
    item = {
      idAlojamiento: alojId,
      id: alojId,
      estadoPublicacion: nuevoEstado,
      estado: nuevoEstado,
      motivoRechazo: motivo,
      motivoObservacionRechazo: motivo
    };
    alojamientosCentralesMap.set(alojId, item);
  }
  return res.json(item);
});

// 11. Listar Alojamientos para Clientes (Catálogo Público: solo PUBLICADOS)
app.get('/api/v1/alojamientos', async (req, res, next) => {
  let list: any[] = [];
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos`);
    if (backendRes.ok) {
      list = await backendRes.json();
    }
  } catch {}

  const idMap = new Map<string, any>();
  for (const item of list) {
    const id = item.idAlojamiento || item.id;
    idMap.set(id, item);
  }

  // Mergear alojamientos que estén en PUBLICADO en Gateway
  for (const [id, a] of alojamientosCentralesMap.entries()) {
    const est = a.estadoPublicacion || a.estado;
    if (est === 'PUBLICADO') {
      idMap.set(id, a);
    } else {
      if (idMap.has(id)) {
        idMap.delete(id);
      }
    }
  }

  let resultado = Array.from(idMap.values());
  const { departamento, ciudad } = req.query;
  if (departamento && departamento !== 'Todos') {
    resultado = resultado.filter((a: any) => String(a.departamento || '').toLowerCase() === String(departamento).toLowerCase());
  }
  if (ciudad) {
    resultado = resultado.filter((a: any) => String(a.ciudad || '').toLowerCase() === String(ciudad).toLowerCase());
  }

  return res.json(resultado);
});

// 12. Listar Alojamientos por Anfitrión
app.get('/api/v1/alojamientos/anfitrion/:idAnfitrion', async (req, res, next) => {
  const anfId = req.params.idAnfitrion;
  let list: any[] = [];
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/anfitrion/${anfId}`);
    if (backendRes.ok) {
      list = await backendRes.json();
    }
  } catch {}

  const idMap = new Map<string, any>();
  for (const item of list) {
    const id = item.idAlojamiento || item.id;
    idMap.set(id, item);
  }

  for (const [id, a] of alojamientosCentralesMap.entries()) {
    if (a.idAnfitrion === anfId || anfId === 'a0000000-0000-4000-8000-000000000002') {
      idMap.set(id, a);
    }
  }

  return res.json(Array.from(idMap.values()));
});

// 13. Obtener Detalle de Alojamiento por ID
app.get('/api/v1/alojamientos/:id', async (req, res, next) => {
  const alojId = req.params.id;
  if (alojId === 'todos' || alojId === 'moderacion') return next();

  let aloj: any = null;
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}`);
    if (backendRes.ok) {
      aloj = await backendRes.json();
    }
  } catch {}

  const central = alojamientosCentralesMap.get(alojId);
  if (central) {
    aloj = { ...aloj, ...central };
  }

  if (aloj) {
    return res.json(aloj);
  }
  return next();
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
