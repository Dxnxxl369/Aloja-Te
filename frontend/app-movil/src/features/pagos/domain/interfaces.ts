// ======================================================================
// ARCHIVO: pagos/domain/interfaces.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Dos contratos: RepositorioPagos (cómo se inicia/consulta un pago) y CasosPagos (lo que la app puede hacer con pagos).
// PARA QUÉ SIRVE: Los casos no saben de HTTP; la UI no sabe del repositorio.
// SIN ÉL: Casos atados a la red y difíciles de probar.
// NO VA AQUÍ: Implementaciones.
// ======================================================================

import type { Pago, SolicitudPago } from './modelos';

export interface RepositorioPagos {
  /** `idempotencyKey` hace que repetir la llamada no cree otro pago. */
  iniciar(solicitud: SolicitudPago, idempotencyKey: string): Promise<Pago>;
  obtener(pagoId: string): Promise<Pago>;
  /** SOLO DEMO: simula el aviso del banco (POST /pagos/:id/confirmar). */
  confirmarSimulado(pagoId: string): Promise<Pago>;
}

export interface CasosPagos {
  iniciarPago(solicitud: SolicitudPago): Promise<Pago>;
  obtenerPago(pagoId: string): Promise<Pago>;
  /** ¿El pago ya no va a cambiar? (COMPLETADO, FALLIDO, REEMBOLSADO) */
  esFinal(pago: Pago): boolean;
  /** Existe solo si la app se arrancó con la simulación habilitada. */
  confirmarSimulado?: (pagoId: string) => Promise<Pago>;
}
