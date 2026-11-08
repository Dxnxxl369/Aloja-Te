// ======================================================================
// ARCHIVO: shared/ui/dinero.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Cómo se escribe el dinero en la app: "480" o "480.50" para precios, y "BOB 480.00" para totales.
// PARA QUÉ SIRVE: Una sola forma de escribir los montos (antes `toFixed(2)` estaba repetido en unos 9 sitios).
// SIN ÉL: Cada pantalla formatearía a su manera y se verían "480" en una y "480.00" en otra.
// NO VA AQUÍ: Cálculos de precios ni React.
// ======================================================================

/** "480" si es entero, "480.50" si tiene centavos. Para precios por noche. */
export function formatearPrecio(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** "BOB 1200.00": un monto con su moneda y siempre dos decimales. Para totales y pagos. */
export function formatearDinero(monto: number, moneda: string): string {
  return `${moneda} ${monto.toFixed(2)}`;
}
