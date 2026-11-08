// ======================================================================
// ARCHIVO: shared/ui/Encabezado.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La barra de arriba de cada pantalla: flecha para volver, título en Playfair y el botón de perfil.
// PARA QUÉ SIRVE: Que todas las pantallas tengan la misma cabecera y respeten la zona segura del celular.
// SIN ÉL: Cada pantalla dibujaría su propia barra.
// NO VA AQUÍ: Navegación ni sesión: solo avisa con `alVolver` y `alPerfil`.
// ======================================================================

import { ArrowLeft, CalendarDays, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Insignia } from './Insignia';
import { Logo } from './Logo';
import { COLOR, ESPACIO, FUENTE } from './tema';

interface Props {
  /** Título de la pantalla. Se ignora si `marca` es true. */
  titulo?: string;
  /** Cabecera del explorador: logo + "Aloja-Te" + BOLIVIA en lugar de flecha y título. */
  marca?: boolean;
  alVolver?: () => void;
  alPerfil?: () => void;
  /** Si se pasa, muestra el acceso a "Mis reservas". */
  alMisReservas?: () => void;
}

export function Encabezado({ titulo, marca, alVolver, alPerfil, alMisReservas }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingTop: insets.top + ESPACIO.s }]}>
      {marca ? (
        <View style={estilos.marca} accessibilityRole="header">
          <Logo tamano={36} />
          <Text style={estilos.nombreMarca} numberOfLines={1}>
            Aloja<Text style={{ color: COLOR.primario }}>-Te</Text>
          </Text>
          <Insignia texto="BOLIVIA" />
        </View>
      ) : (
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
      )}
      <View style={estilos.derecha}>
        {alMisReservas ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mis reservas"
            onPress={alMisReservas}
            style={estilos.icono}
            hitSlop={4}
          >
            <CalendarDays color={COLOR.primario} size={20} />
          </Pressable>
        ) : null}
        {alPerfil ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mi cuenta"
            onPress={alPerfil}
            style={estilos.avatar}
            hitSlop={4}
          >
            <User color="#fff" size={18} />
          </Pressable>
        ) : null}
      </View>
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
  derecha: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  izquierda: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.l, flex: 1 },
  marca: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, flex: 1 },
  nombreMarca: { fontFamily: FUENTE.tituloFuerte, fontSize: 22, color: COLOR.texto, flexShrink: 1 },
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
