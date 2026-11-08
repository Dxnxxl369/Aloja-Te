// ======================================================================
// ARCHIVO: shared/ui/Boton.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El botón de la app.
// PARA QUÉ SIRVE: Un solo botón con estados (deshabilitado, cargando) para todas las pantallas.
// SIN ÉL: Cada pantalla armaría el suyo.
// NO VA AQUÍ: Lógica de negocio.
// ======================================================================
// Variantes del sistema de diseño: primario (azul), secundario (azul suave) y contorno (borde).
// `secundario` se mantiene por compatibilidad: equivale a variante="secundario".

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from './tema';

type Variante = 'primario' | 'secundario' | 'contorno';

interface Props {
  titulo: string;
  onPress: () => void;
  deshabilitado?: boolean;
  cargando?: boolean;
  secundario?: boolean;
  variante?: Variante;
  /** Recibe el color del texto para que el icono combine con la variante. */
  iconoIzquierda?: (color: string) => ReactNode;
  iconoDerecha?: (color: string) => ReactNode;
}

const COLOR_TEXTO: Record<Variante, string> = {
  primario: '#ffffff',
  secundario: COLOR.primario,
  contorno: COLOR.texto,
};

export function Boton({ titulo, onPress, deshabilitado, cargando, secundario, variante, iconoIzquierda, iconoDerecha }: Props) {
  const v: Variante = variante ?? (secundario ? 'secundario' : 'primario');
  const inactivo = deshabilitado || cargando;
  const colorTexto = COLOR_TEXTO[v];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        v === 'primario' && { backgroundColor: pressed ? COLOR.primarioPresionado : COLOR.primario },
        v === 'secundario' && { backgroundColor: pressed ? '#dbeafe' : COLOR.primarioSuave },
        v === 'contorno' && { backgroundColor: pressed ? COLOR.fondo : 'transparent', borderWidth: 1, borderColor: COLOR.borde },
        inactivo && estilos.inactivo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <>
          {iconoIzquierda?.(colorTexto)}
          <Text style={[estilos.texto, { color: colorTexto }]}>{titulo}</Text>
          {iconoDerecha?.(colorTexto)}
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: ESPACIO.l,
    borderRadius: RADIO.control,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: ESPACIO.s,
  },
  inactivo: { opacity: 0.5 },
  texto: { ...FUENTE.semi, fontSize: TAMANO.cuerpo },
});
