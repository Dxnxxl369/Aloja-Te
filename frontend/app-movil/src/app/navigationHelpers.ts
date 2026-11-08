// ======================================================================
// ARCHIVO: app/navigationHelpers.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Dos ayudantes que usan varias rutas: un "volver" que nunca falla y los datos con los que se abre el agente desde un alojamiento.
// PARA QUÉ SIRVE: Escribirlos una sola vez en lugar de dentro de navegacion.tsx.
// SIN ÉL: Cada ruta repetiría la lógica de volver.
// NO VA AQUÍ: Pantallas ni reglas de negocio.
// ======================================================================

import { CommonActions } from '@react-navigation/native';
import type { DatosTarjetaAlojamiento } from '../shared/ui/TarjetaAlojamiento';
import type { RutasTabs } from './routeTypes';

/** Lo que el agente necesita saber del alojamiento elegido. `inicio` hace que cada llegada empiece una conversación nueva. */
export function paramsAsistente(datos: DatosTarjetaAlojamiento): RutasTabs['Agente'] {
  return { alojamiento: { id: datos.id, titulo: datos.titulo, ciudad: datos.ciudad ?? '' }, inicio: Date.now() };
}

/**
 * "Volver" que nunca falla: si no hay pantalla anterior (por ejemplo, la pantalla se abrió desde un aviso con la app cerrada),
 * va a Explorar en lugar de dar el error "GO_BACK was not handled". Sirve para pantallas de pestañas y de la pila.
 */
export const volverSeguro =
  (navigation: { canGoBack: () => boolean; goBack: () => void; dispatch: (accion: ReturnType<typeof CommonActions.navigate>) => void }) =>
  () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.dispatch(CommonActions.navigate({ name: 'Tabs', params: { screen: 'Explorar' } }));
  };
