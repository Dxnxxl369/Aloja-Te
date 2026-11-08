// ======================================================================
// ARCHIVO: pagos/constantes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Todos los valores fijos del feature pagos.
// PARA QUÉ SIRVE: Cambiar una ruta o un plazo en un solo lugar.
// SIN ÉL: Rutas y números repartidos por el código.
// NO VA AQUÍ: Lógica ni variables de entorno.
// ======================================================================

/** Ruta de MS-03 vía Gateway (routes/api.php: /api/v1/pagos). */
export const RUTA_PAGOS = '/api/v1/pagos';

/** Único método que acepta MS-03 hoy (ProcesarPagoDTO: 'QR_SIMPLE_BNB'). */
export const METODO_PAGO = 'QR_SIMPLE_BNB';

/** Cada cuánto se pregunta si el banco ya confirmó el pago. */
export const POLL_PAGO_MS = 3_000;

export const ESTADOS_PAGO = ['PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO'] as const;
