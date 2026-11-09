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

/** Cuánto tiempo (ms) se muestra "¡Copiado!" después de copiar la glosa. */
export const COPIED_FEEDBACK_MS = 2_000;

/** Cuántas letras tiene el código corto de la transacción que se le muestra al usuario. */
export const SHORT_ID_LENGTH = 8;

/** Lado (px) del QR dentro de la tarjeta de pago y del QR ampliado. */
export const QR_SIZE = 200;
export const QR_ZOOM_SIZE = 280;
