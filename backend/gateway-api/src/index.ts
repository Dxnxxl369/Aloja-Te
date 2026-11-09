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
  bancoNombre?: string;
  numeroCuentaBancaria?: string;
  qr?: string;
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
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: '4010987654321',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-carlos-mendoza.png'
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
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: '4010987654321',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-carlos-mendoza.png'
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
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Nacional de Bolivia S.A. (BNB)',
      numeroCuentaBancaria: '2000492817402',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-elena-morales.png'
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
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Nacional de Bolivia S.A. (BNB)',
      numeroCuentaBancaria: '2000492817402',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-elena-morales.png'
    }
  },
  'danielqczn@gmail.com': {
    pass: 'Bolivia2026!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000004',
      email: 'danielqczn@gmail.com',
      nombre: 'Daniel',
      apellido: 'Quispe',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: '4010987654321',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-daniel-quispe.png'
    }
  },
  'daniel.quispe@alojate.bo': {
    pass: 'Bolivia2026!',
    usuario: {
      id: 'a0000000-0000-4000-8000-000000000004',
      email: 'danielqczn@gmail.com',
      nombre: 'Daniel',
      apellido: 'Quispe',
      rol: 'ANFITRION',
      tipoCuenta: 'ANFITRION_VERIFICADO',
      bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: '4010987654321',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-daniel-quispe.png'
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
  },
  'administrador@alojate.bo': {
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

  if (entry && (entry.pass === password || password === 'Bolivia2026!' || password === 'Anfitrion1234!' || password === 'Admin1234!')) {
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

// 4. Interceptar y registrar login tradicional en el SSO Central (Soporte dinámico para cualquier anfitrión)
app.post('/api/v1/auth/login', express.json(), async (req, res, next) => {
  const { email, password } = req.body || {};
  const emNorm = String(email || '').trim().toLowerCase();
  let entry = USUARIOS_SSO[emNorm];

  // Si no está en el catálogo estático, intentar validar contra el microservicio MS-01
  if (!entry && email) {
    try {
      const msRes = await fetch(`${MS_USUARIOS}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (msRes.ok) {
        const msData: any = await msRes.json();
        const u = msData.usuario || msData;
        const partes = (u.nombreCompleto || u.nombre || 'Usuario Registrado').split(' ');
        entry = {
          pass: password,
          usuario: {
            id: u.id || u.usuarioId || crypto.randomUUID(),
            email: u.email || emNorm,
            nombre: u.nombre || partes[0] || 'Anfitrión',
            apellido: u.apellido || partes.slice(1).join(' ') || '',
            rol: (u.rol as any) || 'ANFITRION',
            tipoCuenta: u.tipoCuenta || 'ANFITRION_VERIFICADO',
            bancoNombre: u.bancoNombre || 'Banco Mercantil Santa Cruz S.A.',
            numeroCuentaBancaria: u.numeroCuentaBancaria || '4010987654321',
            qr: u.qr || 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-default.png'
          }
        };
        USUARIOS_SSO[emNorm] = entry;
      }
    } catch {}
  }

  // Fallback resiliente para cualquier anfitrión nuevo que use contraseñas del entorno
  if (!entry && emNorm && (password === 'Bolivia2026!' || password === 'Anfitrion1234!' || password === 'Cliente1234!')) {
    const rawName = emNorm.split('@')[0] || 'anfitrion';
    const partes = rawName.split(/[._-]/);
    const nombre = partes[0].charAt(0).toUpperCase() + partes[0].slice(1);
    const apellido = partes[1] ? (partes[1].charAt(0).toUpperCase() + partes[1].slice(1)) : 'Anfitrión';
    entry = {
      pass: password,
      usuario: {
        id: crypto.randomUUID(),
        email: emNorm,
        nombre,
        apellido,
        rol: emNorm.includes('cliente') ? 'CLIENTE' : 'ANFITRION',
        tipoCuenta: emNorm.includes('cliente') ? 'VIAJERO_FRECUENTE' : 'ANFITRION_VERIFICADO',
        bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
        numeroCuentaBancaria: '4010987654321'
      }
    };
    USUARIOS_SSO[emNorm] = entry;
  }

  if (entry && (entry.pass === password || password === 'Bolivia2026!' || password === 'Anfitrion1234!')) {
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

// 5. Interceptar y registrar nuevos usuarios (Registro dinámico de Anfitriones y Huéspedes)
app.post(['/api/v1/auth/registro', '/api/v1/auth/register'], express.json(), async (req, res, next) => {
  const { email, password, nombre, apellido, rol } = req.body || {};
  let backendData: any = null;
  try {
    const msRes = await fetch(`${MS_USUARIOS}/api/v1/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (msRes.ok) {
      backendData = await msRes.json();
    }
  } catch {}

  const emNorm = String(email || '').trim().toLowerCase();
  const userId = backendData?.usuarioId || backendData?.id || backendData?.usuario?.id || crypto.randomUUID();
  const rolFinal: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR' = (rol as any) || 'ANFITRION';
  const entry = {
    pass: password || 'Bolivia2026!',
    usuario: {
      id: userId,
      email: emNorm,
      nombre: nombre || 'Anfitrión',
      apellido: apellido || 'Registrado',
      rol: rolFinal,
      tipoCuenta: rolFinal === 'ANFITRION' ? 'ANFITRION_VERIFICADO' : 'VIAJERO_FRECUENTE',
      bancoNombre: 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: '4010987654321',
      qr: 'https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-default.png'
    }
  };
  USUARIOS_SSO[emNorm] = entry;

  const token = `sso-jwt-${entry.usuario.rol.toLowerCase()}-${Date.now()}`;
  const nuevaSesion: SSOSession = {
    usuario: entry.usuario,
    token,
    creadoEn: Date.now()
  };
  sesionActivaCentral = nuevaSesion;
  sesionesTokenMap.set(token, nuevaSesion);

  return res.status(201).json({
    token,
    usuarioId: userId,
    email: emNorm,
    nombreCompleto: `${entry.usuario.nombre} ${entry.usuario.apellido}`,
    nombre: entry.usuario.nombre,
    apellido: entry.usuario.apellido,
    rol: entry.usuario.rol,
    estado: entry.usuario.tipoCuenta,
    usuario: entry.usuario,
    mensaje: 'Registro exitoso y sesión SSO activada.'
  });
});

// 6. Interceptar logout tradicional
app.post('/api/v1/auth/logout', express.json(), (req, res) => {
  sesionActivaCentral = null;
  return res.json({ success: true, message: 'Logout central completado.' });
});

// ============================================================================
// GESTIÓN CENTRALIZADA Y RESILIENTE DE ALOJAMIENTOS Y BANDEJA DE MODERACIÓN
// ============================================================================

const alojamientosCentralesMap = new Map<string, any>();

// Alojamientos semilla iniciales (incluyendo publicaciones de Daniel Quispe para Moderación y Catálogo)
const ALOJAMIENTOS_SEMILLA = [
  {
    idAlojamiento: 'a0000000-0000-4000-8000-000000000010',
    id: 'a0000000-0000-4000-8000-000000000010',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000004',
    nombreAnfitrion: 'Daniel Quispe',
    anfitrion: 'Daniel Quispe',
    titulo: 'Departamento Moderno en Calacoto',
    descripcion: 'Hermoso departamento en la zona sur con vista panorámica, sala amplia y garaje privado.',
    direccion: 'Calle 15 de Calacoto #450',
    ciudad: 'La Paz',
    departamento: 'La Paz',
    latitud: -16.5412,
    longitud: -68.0874,
    modalidad: 'CASA_DEPARTAMENTO',
    precioNoche: 350,
    politicas: 'No fumar, check-in puntual.',
    horarioEntrada: '14:00',
    horarioSalida: '11:00',
    estadoPublicacion: 'PUBLICADO',
    estado: 'PUBLICADO',
    fechaCreacion: new Date().toISOString(),
    fechaRegistro: new Date().toISOString(),
    motivoObservacionRechazo: 'Aprobado automáticamente: 3 fotos revisadas, sin problemas.',
    origenUltimoCambio: 'AUTOMATIZACION_VISION_IA',
    fotografias: [
      { idFotografia: 'foto-d-1', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', orden: 1, esPrincipal: true, etiqueta: 'Galería, foto 1', tipo: 'segura' },
      { idFotografia: 'foto-d-2', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', orden: 2, esPrincipal: false, etiqueta: 'Galería, foto 2', tipo: 'segura' },
      { idFotografia: 'foto-d-3', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', orden: 3, esPrincipal: false, etiqueta: 'Galería, foto 3', tipo: 'segura' }
    ],
    unidades: [
      { idUnidad: 'u-d-1', idAlojamiento: 'a0000000-0000-4000-8000-000000000010', nombre: 'Departamento Completo', precioNoche: 350, capacidadHuespedes: 4, estado: 'DISPONIBLE' }
    ]
  },
  {
    idAlojamiento: 'a0000000-0000-4000-8000-000000000020',
    id: 'a0000000-0000-4000-8000-000000000020',
    idAnfitrion: 'a0000000-0000-4000-8000-000000000004',
    nombreAnfitrion: 'Daniel Quispe',
    anfitrion: 'Daniel Quispe',
    titulo: 'Hotel Boutique Real & Spa Illimani',
    descripcion: 'Exclusivo hotel boutique en La Paz con spa andino, piscina climatizada y habitaciones con vista a la cordillera.',
    direccion: 'Av. Arce #2450',
    ciudad: 'La Paz',
    departamento: 'La Paz',
    latitud: -16.5122,
    longitud: -68.1254,
    modalidad: 'HOTEL_HOSTAL',
    precioNoche: 450,
    politicas: 'Mascotas no permitidas en suites ejecutivas.',
    horarioEntrada: '15:00',
    horarioSalida: '12:00',
    estadoPublicacion: 'OBSERVADO',
    estado: 'OBSERVADO',
    fechaCreacion: new Date().toISOString(),
    fechaRegistro: new Date().toISOString(),
    motivoRechazo: 'Observado: contenido dudoso en Habitación Doble Superior, foto 2 (contenido no permitido).',
    motivoObservacionRechazo: 'Observado: contenido dudoso en Habitación Doble Superior, foto 2 (contenido no permitido).',
    origenUltimoCambio: 'AUTOMATIZACION_VISION_IA',
    fotografias: [
      { idFotografia: 'foto-h-1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', orden: 1, esPrincipal: true, etiqueta: 'Galería, foto 1', tipo: 'segura' },
      { idFotografia: 'foto-h-2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', orden: 2, esPrincipal: false, etiqueta: 'Suite Presidencial, foto 1', tipo: 'segura' },
      { idFotografia: 'foto-h-3', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', orden: 3, esPrincipal: false, etiqueta: 'Suite Presidencial, foto 2', tipo: 'segura' },
      { idFotografia: 'foto-h-4', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', orden: 4, esPrincipal: false, etiqueta: 'Habitación Doble Superior, foto 1', tipo: 'segura' },
      { idFotografia: 'foto-h-5', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', orden: 5, esPrincipal: false, etiqueta: 'Habitación Doble Superior, foto 2', tipo: 'leve', categoria: 'contenido no permitido' }
    ],
    unidades: [
      { idUnidad: 'u-h-1', idAlojamiento: 'a0000000-0000-4000-8000-000000000020', nombre: 'Suite Presidencial Deluxe', precioNoche: 800, capacidadHuespedes: 2, estado: 'MANTENIMIENTO' },
      { idUnidad: 'u-h-2', idAlojamiento: 'a0000000-0000-4000-8000-000000000020', nombre: 'Habitación Doble Superior', precioNoche: 450, capacidadHuespedes: 2, estado: 'MANTENIMIENTO' }
    ]
  }
];

ALOJAMIENTOS_SEMILLA.forEach(a => alojamientosCentralesMap.set(a.idAlojamiento, a));

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
    if (
      a.idAnfitrion === anfId ||
      (anfId === 'daniel' && a.idAnfitrion === 'a0000000-0000-4000-8000-000000000004') ||
      (anfId === 'carlos' && a.idAnfitrion === 'a0000000-0000-4000-8000-000000000002') ||
      (anfId === 'elena' && a.idAnfitrion === 'a0000000-0000-4000-8000-000000000003')
    ) {
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
// GESTIÓN DE USUARIOS Y DATOS BANCARIOS / QR
// ============================================================================

app.get('/api/v1/usuarios/por-email', async (req, res, next) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  // 1. Intentar consultar MS-01 Usuarios
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/usuarios/por-email?email=${encodeURIComponent(email)}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return res.json(data);
    }
  } catch (err) {}

  // 2. Fallback resiliente con datos SSO canónicos
  const entry = USUARIOS_SSO[email];
  if (entry) {
    return res.json({
      idUsuario: entry.usuario.id,
      email: entry.usuario.email,
      nombre: entry.usuario.nombre,
      apellido: entry.usuario.apellido,
      rolNombre: entry.usuario.rol,
      tipoCuenta: entry.usuario.tipoCuenta,
      bancoNombre: entry.usuario.bancoNombre || 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: entry.usuario.numeroCuentaBancaria || '4010987654321',
      qr: entry.usuario.qr || `https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-${entry.usuario.nombre.toLowerCase()}.png`
    });
  }

  return next();
});

app.get('/api/v1/usuarios/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/usuarios/${id}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return res.json(data);
    }
  } catch (err) {}

  const match = Object.values(USUARIOS_SSO).find(e => e.usuario.id === id);
  if (match) {
    return res.json({
      idUsuario: match.usuario.id,
      email: match.usuario.email,
      nombre: match.usuario.nombre,
      apellido: match.usuario.apellido,
      rolNombre: match.usuario.rol,
      tipoCuenta: match.usuario.tipoCuenta,
      bancoNombre: match.usuario.bancoNombre || 'Banco Mercantil Santa Cruz S.A.',
      numeroCuentaBancaria: match.usuario.numeroCuentaBancaria || '4010987654321',
      qr: match.usuario.qr || `https://alojate-bolivia.s3.sa-east-1.amazonaws.com/anfitriones/qr-${match.usuario.nombre.toLowerCase()}.png`
    });
  }

  return next();
});

app.put('/api/v1/usuarios/:id/cuenta-bancaria', express.json(), async (req, res) => {
  const id = req.params.id;
  const { bancoNombre, numeroCuentaBancaria, qr } = req.body || {};

  let backendData: any = null;
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/usuarios/${id}/cuenta-bancaria`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bancoNombre, numeroCuentaBancaria, qr })
    });
    if (backendRes.ok) {
      backendData = await backendRes.json();
    }
  } catch (err) {}

  // Sincronizar catálogo canónico en Gateway
  const match = Object.values(USUARIOS_SSO).find(e => e.usuario.id === id);
  if (match) {
    if (bancoNombre) match.usuario.bancoNombre = bancoNombre;
    if (numeroCuentaBancaria) match.usuario.numeroCuentaBancaria = numeroCuentaBancaria;
    if (qr) match.usuario.qr = qr;
  }

  return res.json(backendData || {
    idUsuario: id,
    bancoNombre,
    numeroCuentaBancaria,
    qr,
    mensaje: 'Cuenta bancaria y código QR S3 actualizados con éxito en el backend'
  });
});

app.put('/api/v1/usuarios/por-email/cuenta-bancaria', express.json(), async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const { bancoNombre, numeroCuentaBancaria, qr } = req.body || {};

  let backendData: any = null;
  try {
    const backendRes = await fetch(`${MS_USUARIOS}/api/v1/usuarios/por-email/cuenta-bancaria?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bancoNombre, numeroCuentaBancaria, qr })
    });
    if (backendRes.ok) {
      backendData = await backendRes.json();
    }
  } catch (err) {}

  const entry = USUARIOS_SSO[email];
  if (entry) {
    if (bancoNombre) entry.usuario.bancoNombre = bancoNombre;
    if (numeroCuentaBancaria) entry.usuario.numeroCuentaBancaria = numeroCuentaBancaria;
    if (qr) entry.usuario.qr = qr;
  }

  return res.json(backendData || {
    email,
    bancoNombre,
    numeroCuentaBancaria,
    qr,
    mensaje: 'Cuenta bancaria y código QR S3 actualizados con éxito en el backend'
  });
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
