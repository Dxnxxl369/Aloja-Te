// ======================================================================
// ARCHIVO: reservas/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Todos los valores fijos del feature reservas.
// PARA QUÉ SIRVE: Cambiar una ruta, un plazo o un límite en un solo lugar.
// SIN ÉL: Números y rutas repartidos por el código.
// NO VA AQUÍ: Lógica ni lectura de variables de entorno.
// ======================================================================

/** Ruta de MS-02 vía Gateway (ReservasController: @Controller('api/v1/reservas')). */
export const RUTA_RESERVAS = '/api/v1/reservas';

/** Tipo de la operación en la cola offline de core. */
export const TIPO_OP_CREAR_RESERVA = 'CREAR_RESERVA';

/** MS-02 bloquea las fechas 15 minutos (ttl) hasta que se pague. */
export const MINUTOS_BLOQUEO = 15;

/** Cada cuánto se vuelve a preguntar el estado mientras espera el pago. */
export const POLL_RESERVA_MS = 4_000;

export const MAX_NOCHES = 30;

/** Bolivia no usa horario de verano: UTC-4 todo el año. */
export const OFFSET_BOLIVIA_MS = -4 * 60 * 60 * 1000;

/** Prefijos de la caché local (tabla `cache` de core). */
export const CACHE = {
  PREFIJO_RESERVA: 'reserva:',
  PREFIJO_CLAVE: 'reserva-clave:',
  PREFIJO_LISTA: 'reservas-cliente:',
  TTL_MS: 24 * 60 * 60 * 1000,
} as const;

export const ESTADOS_RESERVA = [
  'PENDIENTE_PAGO',
  'CONFIRMADA',
  'CHECKIN_REALIZADO',
  'COMPLETADA',
  'CANCELADA',
  'EXPIRADA',
  'RECHAZADA_COMPENSADA',
] as const;
