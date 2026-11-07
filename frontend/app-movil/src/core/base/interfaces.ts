// ======================================================================
// ARCHIVO: base/interfaces.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El contrato de "estado que se puede mirar": get() y suscribir().
// PARA QUÉ SIRVE: Entregar el estado a las pantallas en solo lectura, sin dejar que lo modifiquen.
// SIN ÉL: Habría que exponer el store completo, con su set().
// NO VA AQUÍ: Código que haga cosas. Solo contratos.
// ======================================================================

/** Vista de solo lectura de un estado observable. */
export interface StoreLectura<T> {
  get(): T;
  suscribir(callback: () => void): () => void;
}
