// ======================================================================
// ARCHIVO: shared/ui/Encabezado.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La barra de arriba de cada pantalla: flecha para volver, título en Playfair y el botón de perfil.
// PARA QUÉ SIRVE: Que todas las pantallas tengan la misma cabecera y respeten la zona segura del celular.
// SIN ÉL: Cada pantalla dibujaría su propia barra.
// NO VA AQUÍ: Navegación ni sesión: solo avisa con `alVolver` y `alPerfil`.
// ======================================================================

import { ArrowLeft, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR, ESPACIO, FUENTE } from './tema';

interface Props {
  titulo: string;
  alVolver?: () => void;
  alPerfil?: () => void;
}

export function Encabezado({ titulo, alVolver, alPerfil }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingTop: insets.top + ESPACIO.s }]}>
      <View style={estilos.izquierda}>
        {alVolver ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={alVolver} hitSlop={12}>
            <ArrowLeft color={COLOR.texto} size={24} />
          </Pressable>
        ) : null}
        <Text style={estilos.titulo} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      {alPerfil ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Mi cuenta" onPress={alPerfil} style={estilos.avatar}>
          <User color="#fff" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ESPACIO.l,
    paddingBottom: ESPACIO.m,
    backgroundColor: COLOR.fondo,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borde,
  },
  izquierda: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.l, flex: 1 },
  titulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto, flexShrink: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
