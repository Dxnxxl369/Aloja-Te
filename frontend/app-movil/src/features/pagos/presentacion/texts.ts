// ======================================================================
// ARCHIVO: pagos/presentacion/texts.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Todos los textos que ve el usuario en la pantalla de pago.
// PARA QUÉ SIRVE: Tener las frases en un solo lugar, fuera del dibujo; así se revisan y se cambian sin tocar los componentes.
// SIN ÉL: Unas 25 frases estaban escritas dentro de PantallaPago.
// NO VA AQUÍ: Números ni reglas (van en ../constantes.ts) ni lógica.
// ======================================================================
// Nombres en inglés (código nuevo); los valores son lo que ve el usuario, en español simple y sin tecnicismos.

export const PAYMENT_TEXT = {
  // Carga y error al iniciar
  PREPARING: 'Preparando tu pago…',
  START_FAILED: 'No se pudo iniciar el pago.',

  // Resumen
  SUMMARY_TITLE: 'Resumen de pago',
  LODGING: 'Alojamiento',
  DISCOUNT: 'Descuento',
  SERVICE_FEE: 'Cargo de servicio',
  TOTAL: 'Total a pagar',

  // Tarjeta del QR
  QR_TITLE: 'Paga con QR Simple',
  ZOOM_QR: 'Ampliar QR',
  ZOOM_QR_LABEL: 'Ampliar código QR',
  GLOSS: 'Glosa:',
  COPIED: '¡Copiado!',
  GLOSS_COPIED_LABEL: 'Glosa copiada',
  TRANSACTION: 'Transacción',
  PAY_BEFORE: 'Paga antes de las',
  QR_UNAVAILABLE: 'El QR ya no está disponible en esta sesión. Vuelve a la reserva e inténtalo de nuevo.',
  WAITING_BANK: 'Esperando la confirmación del banco…',
  SIMULATE_BANK: 'Simular pago del banco (demo)',
  QR_EXPIRES_IN: 'El código QR expira en ',
  QR_EXPIRED_SHORT: 'El código QR expiró',
  QR_EXPIRED_TITLE: 'El código QR ha vencido',
  QR_EXPIRED_HELP: 'Si ya pagaste, espera unos segundos: tu reserva se confirma sola. Si no, vuelve a la reserva.',
  BACK_TO_RESERVATION: 'Volver a la reserva',

  // Resultado
  APPROVED: '¡Pago aprobado!',
  SEE_RESERVATION: 'Ver mi reserva',
  FAILED: 'No se pudo completar el pago',
  REFUNDED: 'El pago fue reembolsado',
  BACK: 'Volver',

  // Pie y QR ampliado
  SECURE: 'Transacción protegida · Pago con QR Simple',
  TAP_TO_CLOSE: 'Toca para cerrar',
  CLOSE_ZOOM_LABEL: 'Cerrar QR ampliado',
} as const;
