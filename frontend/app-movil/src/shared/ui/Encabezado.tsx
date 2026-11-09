// ======================================================================
// ARCHIVO: shared/ui/Encabezado.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La barra de arriba de cada pantalla: flecha para volver, el título y, si aplica, compartir.
// PARA QUÉ SIRVE: Que todas las pantallas tengan la misma cabecera y respeten la zona segura del celular.
// SIN ÉL: Cada pantalla dibujaría su propia barra.
// NO VA AQUÍ: Navegación ni sesión: solo avisa con `alVolver` y `alCompartir`. El perfil se abre desde la barra de abajo.
// ======================================================================

import { ArrowLeft, Share2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from './Logo';
import { COLOR, ESPACIO, FUENTE, TAMANO } from './tema';

interface Props {
  /** Título de la pantalla. Se ignora si `marca` es true. */
  titulo?: string;
  /** Cabecera del explorador: logo + "Aloja-Te" en lugar de flecha y título. */
  marca?: boolean;
  alVolver?: () => void;
  /** Si se pasa, muestra el botón de compartir a la derecha. */
  alCompartir?: () => void;
  /** Algo propio de la pantalla a la derecha del título (por ejemplo, el punto de modo del agente). */
  derecha?: ReactNode;
}

export function Encabezado({ titulo, marca, alVolver, alCompartir, derecha }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingTop: insets.top + ESPACIO.s }]}>
      {marca ? (
        <View style={estilos.marca} accessibilityRole="header">
          <Logo tamano={36} />
          <Text style={estilos.nombreMarca} numberOfLines={1}>
            Aloja<Text style={{ color: COLOR.primario }}>-Te</Text>
          </Text>
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
        {alCompartir ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compartir"
            onPress={alCompartir}
            style={estilos.icono}
            hitSlop={4}
          >
            <Share2 color={COLOR.primario} size={20} />
          </Pressable>
        ) : null}
        {derecha}
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
  nombreMarca: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto, flexShrink: 1 },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto, flexShrink: 1 },
});
