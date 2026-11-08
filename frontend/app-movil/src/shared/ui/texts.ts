// ======================================================================
// ARCHIVO: shared/ui/texts.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los textos de botones y enlaces que se repiten en varias pantallas ("Reintentar", "Ver menos", "Aplicar", "Reservar").
// PARA QUÉ SIRVE: Escribir cada frase común una sola vez, para que se llame igual en toda la app.
// SIN ÉL: "Reintentar" estaba escrito en 5 pantallas y "Ver menos" en 2.
// NO VA AQUÍ: Textos de una sola pantalla (van en el texts.ts de su feature) ni lógica.
// ======================================================================
// Nombres en inglés a propósito: es código nuevo y se acordó que lo nuevo va en inglés. Los valores son lo que ve el usuario.

export const COMMON_TEXT = {
  RETRY: 'Reintentar',
  SEE_LESS: 'Ver menos',
  APPLY: 'Aplicar',
  RESERVE: 'Reservar',
} as const;
