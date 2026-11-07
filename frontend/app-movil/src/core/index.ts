// ======================================================================
// ARCHIVO: index.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La puerta de entrada de core.
// PARA QUÉ SIRVE: Los features importan solo de aquí; así se puede reorganizar el interior sin romper nada y la regla de ESLint puede vigilar que se cumpla.
// SIN ÉL: Funciona, pero cualquiera importaría archivos internos y todo se enreda.
// NO VA AQUÍ: Código. Solo reexporta.
// ======================================================================
// Puerta única de core. Los features importan SOLO de aquí:
//   import { api, cola, AppError } from '../../core';
// Una regla de eslint-plugin-boundaries hace fallar el build si importan
// cualquier otro archivo de core o si core importa de features/.

// Piezas listas para usar
export {
  api,
  auth,
  cola,
  iniciarCore,
  modeloLocal,
  nuevoId,
  sincronizador,
  useEstadoModelo,
  useEstadoSync,
} from './di/composicion';
export { PAGO_SIMULADO_HABILITADO } from './base/constantes';
export { SesionProvider, useSesion } from './auth/SesionProvider';
export { consultar, consultarUno, ejecutar, guardarCache, leerCache, transaccion } from './db/db';
export { esReintentable, esSinRed } from './base/errores';

// Modelos (objetos con atributos)
export { AppError } from './base/modelos';
export type { TipoError } from './base/modelos';
export type { Sesion } from './auth/modelos';
export type { Migracion } from './db/modelos';
export type { OpcionesPeticion } from './http/modelos'; // los DTO (LoginDto) y las filas (OperacionFila) NO se exportan: son internos
export type { EstadoSync, Manejador, Operacion } from './offline/modelos';
export type { EstadoModelo } from './ia/modelos';

// Interfaces (contratos)
export type { ServicioAuth } from './auth/interfaces';
export type { Api } from './http/interfaces';
export type { Cola, Sincronizador } from './offline/interfaces';
export type { ModeloLocal } from './ia/interfaces';
