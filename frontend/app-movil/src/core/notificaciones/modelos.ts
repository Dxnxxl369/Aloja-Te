// ======================================================================
// ARCHIVO: core/notificaciones/modelos.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: La forma de un aviso programado en el celular.
// PARA QUÉ SIRVE: Que los features describan "qué avisar y cuándo" sin conocer la librería de notificaciones.
// SIN ÉL: Cada feature inventaría su propio formato.
// NO VA AQUÍ: Lógica de cuándo avisar (es de cada feature) ni código de la librería (es notificador.ts).
// ======================================================================

/** Un aviso local: una notificación que el propio celular muestra a la hora indicada, aunque la app esté cerrada. */
export interface AvisoLocal {
  /** Identificador estable: el mismo aviso siempre tiene el mismo id, así no se duplica al sincronizar. */
  id: string;
  titulo: string;
  cuerpo: string;
  /** Cuándo mostrarlo (epoch ms). */
  cuando: number;
  /** Datos que vuelven al tocar el aviso (por ejemplo `{ reservaId }`). Solo texto. */
  datos: Record<string, string>;
}
