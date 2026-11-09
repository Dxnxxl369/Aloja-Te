// ======================================================================
// ARCHIVO: app/BarraTabsAnfitrion.tsx
// QUÉ ES: La barra de navegación inferior exclusiva para el rol Anfitrión.
// Pestañas en orden estricto: Dashboard, Propiedades, Finanzas, Perfil.
// ======================================================================

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Building, LayoutDashboard, LucideIcon, User, Wallet } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR, ESPACIO, FUENTE, SOMBRA_FLOTANTE } from '../shared/ui/tema';

interface Item {
  etiqueta: string;
  Icono: LucideIcon;
}

const ITEMS: Record<string, Item> = {
  Dashboard: { etiqueta: 'Dashboard', Icono: LayoutDashboard },
  Propiedades: { etiqueta: 'Propiedades', Icono: Building },
  Finanzas: { etiqueta: 'Finanzas', Icono: Wallet },
  Perfil: { etiqueta: 'Perfil', Icono: User },
};

export function BarraTabsAnfitrion({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, ESPACIO.s) }]}>
      <View style={estilos.fila}>
        {state.routes.map((ruta, indice) => {
          const item = ITEMS[ruta.name];
          if (!item) return null;
          const enfocada = state.index === indice;
          const { Icono } = item;

          const alTocar = () => {
            const evento = navigation.emit({
              type: 'tabPress',
              target: ruta.key,
              canPreventDefault: true,
            });
            if (!enfocada && !evento.defaultPrevented) {
              navigation.navigate(ruta.name, ruta.params as never);
            }
          };

          return (
            <Pressable
              key={ruta.key}
              accessibilityRole="tab"
              accessibilityLabel={item.etiqueta}
              accessibilityState={{ selected: enfocada }}
              onPress={alTocar}
              style={estilos.item}
            >
              <View style={[estilos.iconoContenedor, enfocada && estilos.iconoContenedorActivo]}>
                <Icono
                  color={enfocada ? COLOR.primario : COLOR.textoSuave}
                  size={24}
                  strokeWidth={enfocada ? 2.4 : 1.8}
                />
              </View>
              <Text
                style={[
                  estilos.etiqueta,
                  enfocada && { color: COLOR.primario, ...FUENTE.semi },
                ]}
              >
                {item.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    alignItems: 'center',
    paddingTop: ESPACIO.xs,
    backgroundColor: COLOR.tarjeta,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: ESPACIO.s,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconoContenedor: {
    padding: 4,
    borderRadius: 12,
  },
  iconoContenedorActivo: {
    backgroundColor: '#EFF6FF',
  },
  etiqueta: {
    fontSize: 11,
    color: COLOR.textoSuave,
    ...FUENTE.normal,
  },
});
