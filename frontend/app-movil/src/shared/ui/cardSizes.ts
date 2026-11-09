// ======================================================================
// ARCHIVO: shared/ui/cardSizes.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Las medidas de las fotos de las tarjetas de alojamiento (la del carrusel y la de la lista).
// PARA QUÉ SIRVE: Que la tarjeta y su "sombra" de carga (esqueleto) usen el MISMO número y no se separen si alguien cambia uno.
// SIN ÉL: El esqueleto repetía `128` y `80` escritos a mano.
// NO VA AQUÍ: Estilos completos de la tarjeta.
// ======================================================================

/** Alto de la foto de la tarjeta vertical (la del carrusel de destacados). */
export const FEATURED_PHOTO_HEIGHT = 128;

/** Lado de la foto cuadrada de la tarjeta en fila (la de la lista). */
export const LIST_PHOTO_SIZE = 80;
