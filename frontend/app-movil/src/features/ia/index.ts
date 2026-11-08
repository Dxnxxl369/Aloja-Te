// ======================================================================
// ARCHIVO: ia/index.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La puerta del feature "ia": la pantalla para gestionar el modelo de IA local.
// PARA QUÉ SIRVE: Un único punto de entrada; la descarga y la carga viven en core/ia.
// SIN ÉL: La raíz de la app importaría archivos internos del feature.
// NO VA AQUÍ: Lógica del modelo.
// ======================================================================

export { PantallaModeloIa } from './presentacion/pantallas/PantallaModeloIa';
export type { EstadoModeloIa } from './presentacion/pantallas/PantallaModeloIa';
