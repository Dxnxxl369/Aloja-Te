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

// Enrutamiento a Microservicios preservando la ruta completa /api/v1/...
// MS-01: Usuarios, Autenticación y Alojamientos
app.use(createProxyMiddleware(proxyOptions(MS_USUARIOS, 
  '/api/v1/auth',
  '/api/v1/usuarios',
  '/api/v1/alojamientos',
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
