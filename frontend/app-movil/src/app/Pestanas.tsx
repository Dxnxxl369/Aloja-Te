// ======================================================================
// ARCHIVO: app/Pestanas.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Las tres pestañas de la app (Explorar, Agente y Perfil) con su barra de abajo y su animación.
// PARA QUÉ SIRVE: Que navegacion.tsx solo arme el contenedor y la pila; las pestañas viven aquí.
// SIN ÉL: Las pestañas estarían mezcladas con la pila de pantallas.
// NO VA AQUÍ: Las pantallas de cada pestaña (son las rutas) ni la barra en sí (es BarraTabs).
// ======================================================================
// Las pestañas se mantienen montadas: el chat del agente conserva su conversación al cambiar de pestaña.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarraTabs } from './BarraTabs';
import type { RutasTabs } from './routeTypes';
import { RutaAgente } from './routes/RutaAgente';
import { RutaExplorar } from './routes/RutaExplorar';
import { RutaPerfil } from './routes/RutaPerfil';

const Tab = createBottomTabNavigator<RutasTabs>();

/** Las tres pestañas (el Agente queda en el centro). Cada una se queda montada al cambiar de pestaña. */
export function Pestanas() {
  return (
    <Tab.Navigator
      initialRouteName="Explorar"
      // "Volver" regresa a la pestaña de la que vienes (por defecto saltaría siempre a Explorar).
      backBehavior="history"
      tabBar={(props) => <BarraTabs {...props} />}
      // Al cambiar de pestaña, un fundido muy corto (50 ms; el normal de la librería es 150): se nota suave pero no hace esperar.
      screenOptions={{ headerShown: false, animation: 'fade', transitionSpec: { animation: 'timing', config: { duration: 50 } } }}
    >
      <Tab.Screen name="Explorar" component={RutaExplorar} />
      <Tab.Screen name="Agente" component={RutaAgente} />
      <Tab.Screen name="Perfil" component={RutaPerfil} />
    </Tab.Navigator>
  );
}
