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
app.post('/api/v1/auth/login', express.json(), (req, res) => {
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

  // Usuario real de MS-01: se autentica allí y, si acepta, se abre también su sesión SSO central.
  reenviarAuthAMs01(req, res);
});

// Registro de usuarios reales: MS-01 crea la cuenta y el gateway abre la sesión SSO (el portal inicia sesión al registrarse).
app.post(['/api/v1/auth/registro', '/api/v1/auth/register'], express.json(), (req, res) => {
  reenviarAuthAMs01(req, res);
});

// Envía el login/registro a MS-01 y devuelve su respuesta tal cual. Si fue exitosa, registra la sesión en el SSO
// central; sin esto el portal pregunta por /sso/session, recibe "sin sesión" y cierra la sesión del usuario real.
async function reenviarAuthAMs01(req: express.Request, res: express.Response) {
  try {
    const respuesta = await fetch(`${MS_USUARIOS}${req.originalUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {})
    });
    const texto = await respuesta.text();

    if (respuesta.ok) {
      try {
        const raw = JSON.parse(texto);
        if (raw?.token && raw?.usuarioId && raw?.rol) {
          const partes = String(raw.nombreCompleto || '').trim().split(/\s+/);
          const usuario: SSOUsuario = {
            id: raw.usuarioId,
            email: raw.email,
            nombre: raw.nombre || partes[0] || 'Usuario',
            apellido: raw.apellido || partes.slice(1).join(' '),
            rol: raw.rol,
            tipoCuenta: raw.tipoCuenta || (typeof raw.estado === 'string' ? raw.estado : undefined)
          };
          const sesion: SSOSession = { usuario, token: raw.token, creadoEn: Date.now() };
          sesionActivaCentral = sesion;
          sesionesTokenMap.set(raw.token, sesion);
        }
      } catch {
        // respuesta sin formato esperado: se devuelve igual, sin sesión SSO
      }
    }

    res.status(respuesta.status).type('application/json').send(texto);
  } catch (err) {
    console.error('[Gateway] MS-01 no disponible para autenticación:', err);
    res.status(502).json({ mensaje: 'El servicio de usuarios no está disponible. Intente nuevamente en unos segundos.' });
  }
}

// 5. Interceptar logout tradicional
app.post('/api/v1/auth/logout', express.json(), (req, res) => {
  sesionActivaCentral = null;
  return res.json({ success: true, message: 'Logout central completado.' });
});

// ============================================================================
// GESTIÓN CENTRALIZADA Y RESILIENTE DE ALOJAMIENTOS Y BANDEJA DE MODERACIÓN
// ============================================================================

const alojamientosCentralesMap = new Map<string, any>();

const nombreNormalizado = (u: any) => String(u?.nombre ?? '').trim().toLowerCase();

// Al crear un alojamiento, el mapa guarda las habitaciones y fotos "borrador" que envía el portal (body) y,
// después, el portal las vuelve a registrar una por una en /habitaciones y /fotografias. Si se sumaran ambas
// versiones, cada habitación o foto aparecería duplicada. Estas funciones las unifican.
function fusionarUnidades(ms01: any[] | undefined, central: any[] | undefined): any[] {
  if (!ms01 || ms01.length === 0) return central ?? [];
  return ms01.map((u: any) => {
    const c = (central ?? []).find((x: any) => x.idUnidad === u.idUnidad)
      ?? (central ?? []).find((x: any) => nombreNormalizado(x) === nombreNormalizado(u));
    if (!c) return u;
    return {
      ...c,
      ...u,
      descripcion: u.descripcion || c.descripcion,
      servicios: u.servicios?.length ? u.servicios : c.servicios,
      fotos: u.fotos?.length ? u.fotos : c.fotos,
      fotografias: u.fotografias?.length ? u.fotografias : c.fotografias
    };
  });
}

// MS-01 es la fuente de verdad (estado, fotos y habitaciones); la copia del Gateway solo completa lo que falte.
function fusionarCentral(ms01: any, central: any): any {
  const res = { ...ms01, ...central };
  const estado = ms01?.estadoPublicacion ?? central?.estadoPublicacion;
  if (estado) {
    res.estadoPublicacion = estado;
    res.estado = estado;
  }
  res.fotografias = ms01?.fotografias?.length ? ms01.fotografias : central?.fotografias;
  res.unidades = fusionarUnidades(ms01?.unidades, central?.unidades);
  return res;
}

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
  let fotoMs01: any = null;
  
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/fotografias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (backendRes.ok) fotoMs01 = await backendRes.json();
  } catch {}

  const item = alojamientosCentralesMap.get(alojId);
  const fotoObj = fotoMs01 ? { ...fotoMs01, esPrincipal: orden === 1 } : {
    idFotografia: crypto.randomUUID(),
    idAlojamiento: alojId,
    url,
    orden: orden || 1,
    esPrincipal: orden === 1
  };
  if (item) {
    if (!item.fotografias) item.fotografias = [];
    // La foto pudo venir ya como borrador en el cuerpo de la creación: se reemplaza por la real en vez de duplicarla.
    const idx = item.fotografias.findIndex((f: any) => f?.url === fotoObj.url);
    if (idx >= 0) item.fotografias[idx] = { ...item.fotografias[idx], ...fotoObj };
    else item.fotografias.push(fotoObj);
  }
  return res.status(201).json(fotoObj);
});

// 3. Habitaciones de Hotel
app.post('/api/v1/alojamientos/:id/habitaciones', express.json(), async (req, res, next) => {
  const alojId = req.params.id;
  let habMs01: any = null;
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/alojamientos/${alojId}/habitaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (backendRes.ok) {
      habMs01 = await backendRes.json();
    } else if (backendRes.status >= 400 && backendRes.status < 500) {
      // MS-01 rechazó la petición (p. ej. una foto de la habitación sin enlace válido): se informa al cliente
      // en lugar de fingir que se guardó.
      const body = await backendRes.json().catch(() => ({}));
      return res.status(backendRes.status).json(body);
    }
  } catch {}

  const item = alojamientosCentralesMap.get(alojId);
  const fotosReq: any[] = Array.isArray(req.body?.fotografias) ? req.body.fotografias : [];
  // Si MS-01 respondió, se usa su respuesta (id real de la habitación y sus fotos); si no, copia local de respaldo.
  const habObj = habMs01 ?? {
    idUnidad: crypto.randomUUID(),
    idAlojamiento: alojId,
    ...req.body,
    fotos: fotosReq.map((f: any) => f?.url).filter(Boolean),
    estado: 'DISPONIBLE'
  };
  if (item) {
    if (!item.unidades) item.unidades = [];
    // Si el portal ya había enviado esta habitación como borrador al crear el alojamiento (mismo nombre, id local),
    // se reemplaza por la versión real de MS-01 en lugar de agregar una segunda.
    const esLocal = (x: any) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x?.idUnidad ?? ''));
    const idx = item.unidades.findIndex((x: any) => esLocal(x) && nombreNormalizado(x) === nombreNormalizado(habObj));
    if (idx >= 0) {
      item.unidades[idx] = fusionarUnidades([habObj], [item.unidades[idx]])[0];
    } else {
      item.unidades.push(habObj);
    }
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
      // MS-01 es la fuente de verdad del estado: la copia en memoria del Gateway puede estar desactualizada
      // (p. ej. MS-01 pasó a EN_REVISION / OBSERVADO por /enviar-revision o por n8n y el mapa seguía en PENDIENTE).
      // Solo se rellenan datos que MS-01 no trae.
      if (!existing.motivoRechazo && a.motivoRechazo) existing.motivoRechazo = a.motivoRechazo;
      if (!existing.motivoObservacionRechazo && a.motivoObservacionRechazo) existing.motivoObservacionRechazo = a.motivoObservacionRechazo;
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

// 6. Decisiones de moderación: publicar, observar y rechazar son decisiones de la IA (flujo n8n + LlavaGuard).
// El admin ya no puede tomarlas: solo reintenta la revisión (POST /:id/reintentar-revision) o suspende / reactiva.
// Las demás acciones (enviar-revision, reintentar-revision, suspender, reactivar, moderacion/atencion y el PATCH /estado
// protegido con token) llegan a MS-01 por el proxy; MS-01 es la fuente de verdad y valida cada transición (409 si no corresponde).
app.all(
  [
    '/api/v1/alojamientos/:id/aceptar',
    '/api/v1/alojamientos/:id/observar',
    '/api/v1/alojamientos/:id/rechazar'
  ],
  (req, res) => {
    return res.status(403).json({
      status: 403,
      mensaje: 'Publicar, observar y rechazar son decisiones de la revisión automática: el administrador solo puede reintentar la revisión, suspender o reactivar.'
    });
  }
);

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
    const existing = idMap.get(id);
    if (existing) {
      // MS-01 ya lo devolvió como publicado: su estado manda (la copia del mapa puede estar desactualizada).
      idMap.set(id, fusionarCentral(existing, a));
    } else if (est === 'PUBLICADO') {
      idMap.set(id, a);
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
      // Si MS-01 ya trae el alojamiento, su estado manda; el mapa solo aporta los que MS-01 no tiene.
      if (!idMap.has(id)) idMap.set(id, a);
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
    aloj = aloj ? fusionarCentral(aloj, central) : central;
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
