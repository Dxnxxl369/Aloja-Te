// ======================================================================
// ARCHIVO: app/navegacion.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El armado de la navegación de la sesión iniciada: el contenedor, la pila de pantallas y los avisos de las reservas.
// PARA QUÉ SIRVE: Conecta los features sin que se conozcan entre sí. Las tres pestañas están en Pestanas.tsx; encima van Mis reservas (desde Perfil), Detalle → Reserva → Pago.
// SIN ÉL: Cada feature tendría que importar al otro para navegar.
// NO VA AQUÍ: Reglas de negocio (están en cada feature), el login (es App.tsx), los tipos de rutas (routeTypes.ts) ni cada ruta (app/routes/).
// ======================================================================
// Las rutas son componentes de módulo (no funciones en línea) para que React Navigation no las vuelva a montar en cada render
// y la conversación del agente no se pierda.

import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSesion } from '../core';
import { COLOR } from '../shared/ui/tema';
import { AvisosReservas } from './AvisosReservas';
import { ContextoFeatures } from './features';
import type { Features } from './features';
import { Pestanas } from './Pestanas';
import { PestanasAnfitrion } from './PestanasAnfitrion';
import type { RutasRaiz } from './routeTypes';
import { RutaDetalle } from './routes/RutaDetalle';
import { RutaMisReservas } from './routes/RutaMisReservas';
import { RutaModeloIa } from './routes/RutaModeloIa';
import { RutaPago } from './routes/RutaPago';
import { RutaReserva } from './routes/RutaReserva';
import { RutaReservaManual } from './routes/RutaReservaManual';

const Stack = createNativeStackNavigator<RutasRaiz>();

const TEMA = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: COLOR.fondo, primary: COLOR.primario } };

function PestanasContenedor() {
  const { sesion } = useSesion();
  return sesion?.rol === 'ANFITRION' ? <PestanasAnfitrion /> : <Pestanas />;
}

export function NavegacionApp({ features }: { features: Features }) {
  const navegacion = useNavigationContainerRef();
  const { sesion } = useSesion();
  return (
    <ContextoFeatures.Provider value={features}>
      <NavigationContainer theme={TEMA} ref={navegacion}>
        {/* Notificaciones de las reservas: no dibuja nada. */}
        {sesion ? (
          <AvisosReservas
            navegacion={navegacion}
            casos={features.reservas.casos}
            anfitrionRepo={features.anfitrion}
            clienteId={sesion.usuarioId}
            rol={sesion.rol}
          />
        ) : null}
        {/* Todas las pantallas que se abren encima entran deslizando desde la derecha, igual en cualquier versión de Android. */}
        <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Tabs" component={PestanasContenedor} />
          <Stack.Screen name="MisReservas" component={RutaMisReservas} />
          <Stack.Screen name="Detalle" component={RutaDetalle} />
          <Stack.Screen name="ReservaManual" component={RutaReservaManual} />
          <Stack.Screen name="ModeloIa" component={RutaModeloIa} />
          <Stack.Screen name="Reserva" component={RutaReserva} />
          <Stack.Screen name="Pago" component={RutaPago} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextoFeatures.Provider>
  );
}
