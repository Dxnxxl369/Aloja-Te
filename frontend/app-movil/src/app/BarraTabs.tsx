// ======================================================================
// ARCHIVO: app/BarraTabs.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La barra de pestañas de abajo: Explorar, Agente (al centro) y Perfil.
// PARA QUÉ SIRVE: Cambiar de sección con el pulgar; el Agente va resaltado como en el mockup.
// SIN ÉL: Se vería la barra por defecto de React Navigation, sin el estilo de la app.
// NO VA AQUÍ: Qué pantalla abre cada pestaña (eso es navegacion.tsx).
// ======================================================================
// Es la barra de React Navigation (`tabBar` del navegador): solo dibuja y avisa del toque.
// Se oculta mientras la pestaña Agente está abierta (esa pantalla trae su propia flecha para volver).

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Bot, Compass, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR, ESPACIO, FUENTE, SOMBRA_FLOTANTE, TAMANO } from '../shared/ui/tema';

interface Item {
  etiqueta: string;
  Icono: LucideIcon;
  /** El botón resaltado (círculo azul elevado). */
  destacado?: boolean;
}

/** Los nombres son los de las rutas del navegador de pestañas (navegacion.tsx). */
const ITEMS: Record<string, Item> = {
  Explorar: { etiqueta: 'Explorar', Icono: Compass },
  Agente: { etiqueta: 'Agente', Icono: Bot, destacado: true },
  Perfil: { etiqueta: 'Perfil', Icono: User },
};

export function BarraTabs({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // En el agente no se muestra la barra: la pantalla necesita todo el espacio para el chat y se sale con la flecha de la cabecera.
  if (state.routes[state.index]?.name === 'Agente') return null;
  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, ESPACIO.s) }]}>
      {/* Los 3 botones van juntos en el centro (no repartidos por todo el ancho). */}
      <View style={estilos.fila}>
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
                <Icono color="#fff" size={32} />
              </View>
            ) : (
              <Icono color={enfocada ? COLOR.primario : COLOR.textoSuave} size={30} strokeWidth={enfocada ? 2.4 : 2} />
            )}
            <Text style={[estilos.etiqueta, (enfocada || item.destacado) && { color: COLOR.primario }, enfocada && { ...FUENTE.semi }]}>
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
    paddingTop: ESPACIO.s,
    backgroundColor: COLOR.tarjeta,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  fila: { flexDirection: 'row', alignItems: 'flex-end', width: '100%', maxWidth: 320 },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  // El círculo sube por encima de la barra para que se note el botón principal.
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -28,
    backgroundColor: COLOR.primario,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLOR.tarjeta,
    ...SOMBRA_FLOTANTE,
  },
  etiqueta: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
});
