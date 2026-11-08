// ======================================================================
// ARCHIVO: shared/ui/plural.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Elige entre singular y plural según la cantidad: 1 noche, 3 noches.
// PARA QUÉ SIRVE: Una sola función en lugar de `n === 1 ? 'noche' : 'noches'` escrito a mano en unos 14 sitios.
// SIN ÉL: Cada pantalla repetiría la comparación y se podría olvidar el caso de 1.
// NO VA AQUÍ: Escribir el número: devuelve solo la palabra (se usa como `${n} ${pluralize(n, 'noche', 'noches')}`).
// ======================================================================
// Nombres en inglés a propósito: es código nuevo y se acordó que lo nuevo va en inglés.

/** `singular` si `count` es 1; `plural` en cualquier otro caso (incluido 0). */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
