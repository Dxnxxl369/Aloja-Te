// ======================================================================
// ARCHIVO: app/BarraTabs.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La barra de pestañas de abajo: Explorar, Reservas, Asistente y Perfil.
// PARA QUÉ SIRVE: Cambiar de sección con el pulgar; el Asistente va resaltado como en el mockup.
// SIN ÉL: Se vería la barra por defecto de React Navigation, sin el estilo de la app.
// NO VA AQUÍ: Qué pantalla abre cada pestaña (eso es navegacion.tsx).
// ======================================================================
// Es la barra de React Navigation (`tabBar` del navegador): solo dibuja y avisa del toque.

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Bot, CalendarDays, Compass, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR, ESPACIO, FUENTE, SOMBRA_FLOTANTE } from '../shared/ui/tema';

interface Item {
  etiqueta: string;
  Icono: LucideIcon;
  /** El botón resaltado (círculo azul elevado). */
  destacado?: boolean;
}

/** Los nombres son los de las rutas del navegador de pestañas (navegacion.tsx). */
const ITEMS: Record<string, Item> = {
  Explorar: { etiqueta: 'Explorar', Icono: Compass },
  MisReservas: { etiqueta: 'Reservas', Icono: CalendarDays },
  Agente: { etiqueta: 'Asistente', Icono: Bot, destacado: true },
  Perfil: { etiqueta: 'Perfil', Icono: User },
};

export function BarraTabs({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, ESPACIO.s) }]}>
      {state.routes.map((ruta, indice) => {
        const item = ITEMS[ruta.name];
        if (!item) return null;
        const enfocada = state.index === indice;
        const { Icono } = item;

        const alTocar = () => {
          const evento = navigation.emit({ type: 'tabPress', target: ruta.key, canPreventDefault: true });
          if (!enfocada && !evento.defaultPrevented) navigation.navigate(ruta.name, ruta.params as never);
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
            {item.destacado ? (
              <View style={[estilos.circulo, enfocada && { backgroundColor: COLOR.primarioPresionado }]}>
                <Icono color="#fff" size={24} />
              </View>
            ) : (
              <Icono color={enfocada ? COLOR.primario : COLOR.textoSuave} size={24} />
            )}
            <Text style={[estilos.etiqueta, (enfocada || item.destacado) && { color: COLOR.primario }, enfocada && { fontFamily: FUENTE.semi }]}>
              {item.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: ESPACIO.s,
    backgroundColor: COLOR.tarjeta,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  // El círculo sube por encima de la barra para que se note el botón principal.
  circulo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginTop: -22,
    backgroundColor: COLOR.primario,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLOR.tarjeta,
    ...SOMBRA_FLOTANTE,
  },
  etiqueta: { fontFamily: FUENTE.medio, fontSize: 11, color: COLOR.textoSuave },
});
