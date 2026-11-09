// ======================================================================
// ARCHIVO: shared/ui/tiempo.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Valores y funciones de tiempo que usan varios features: cuánto dura un día, la hora de Bolivia y cómo se escribe una cuenta regresiva.
// PARA QUÉ SIRVE: Una sola definición para cosas que estaban copiadas en 6 archivos (el día en milisegundos) y en dos (formatearSegundos).
// SIN ÉL: Cada feature repetiría los números y la función.
// NO VA AQUÍ: Fechas de calendario ("12 dic": es fechas.ts) ni React.
// ======================================================================

/** Un día en milisegundos. También es lo que duran las copias guardadas (caché) de la app. */
export const DIA_MS = 24 * 60 * 60 * 1000;

/** Bolivia no usa horario de verano: UTC-4 todo el año. */
export const OFFSET_BOLIVIA_MS = -4 * 60 * 60 * 1000;

/** 754 -> "12:34". Para las cuentas regresivas (pago de la reserva, QR). */
export function formatearSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
