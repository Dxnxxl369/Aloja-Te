// ======================================================================
// ARCHIVO: app/PestanasAnfitrion.tsx
// QUÉ ES: El navegador de pestañas para el Anfitrión (Dashboard, Propiedades, Finanzas, Perfil).
// ======================================================================

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { BarraTabsAnfitrion } from './BarraTabsAnfitrion';
import type { RutasTabsAnfitrion } from './routeTypes';
import { RutaDashboard } from './routes/anfitrion/RutaDashboard';
import { RutaFinanzas } from './routes/anfitrion/RutaFinanzas';
import { RutaPerfilAnfitrion } from './routes/anfitrion/RutaPerfilAnfitrion';
import { RutaPropiedades } from './routes/anfitrion/RutaPropiedades';

const Tab = createBottomTabNavigator<RutasTabsAnfitrion>();

export function PestanasAnfitrion() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      backBehavior="history"
      tabBar={(props) => <BarraTabsAnfitrion {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 50 } },
      }}
    >
      <Tab.Screen name="Dashboard" component={RutaDashboard} />
      <Tab.Screen name="Propiedades" component={RutaPropiedades} />
      <Tab.Screen name="Finanzas" component={RutaFinanzas} />
      <Tab.Screen name="Perfil" component={RutaPerfilAnfitrion} />
    </Tab.Navigator>
  );
}
