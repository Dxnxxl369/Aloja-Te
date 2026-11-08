// ======================================================================
// ARCHIVO: shared/ui/Chip.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La píldora tocable de filtros y respuestas rápidas ("Todos", "Santa Cruz", "Opción 1").
// PARA QUÉ SIRVE: Un solo estilo de chip para el explorador y el chat del agente.
// SIN ÉL: Cada pantalla armaría sus propias píldoras con medidas distintas.
// NO VA AQUÍ: Qué filtra cada chip: solo avisa con `onPress`.
// ======================================================================
// Base: blanco con borde. Seleccionado "suave" (DESIGN.md): fondo azul claro y borde azul.
// Seleccionado "solido" (filtro activo del explorador en el mockup): fondo azul y texto blanco.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from './tema';

interface Props {
  etiqueta: string;
  onPress: () => void;
  seleccionado?: boolean;
  /** Cómo se ve cuando está seleccionado. */
  estiloSeleccionado?: 'suave' | 'solido';
  deshabilitado?: boolean;
  /** Recibe el color del texto para que el icono combine con el estado. */
  icono?: (color: string) => ReactNode;
}

export function Chip({ etiqueta, onPress, seleccionado = false, estiloSeleccionado = 'suave', deshabilitado, icono }: Props) {
  const solido = seleccionado && estiloSeleccionado === 'solido';
  const colorTexto = solido ? '#ffffff' : seleccionado ? COLOR.primario : COLOR.textoSuave;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ selected: seleccionado, disabled: !!deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      // La píldora mide 36 de alto (DESIGN.md); hitSlop completa los 44 que pide la accesibilidad.
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [
        estilos.base,
        seleccionado && (solido ? estilos.solido : estilos.suave),
        pressed && !seleccionado && { backgroundColor: COLOR.fondo },
        deshabilitado && { opacity: 0.5 },
      ]}
    >
      {icono?.(colorTexto)}
      <Text style={[estilos.texto, { color: colorTexto }, seleccionado && { ...FUENTE.medio }]} numberOfLines={1}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    // minHeight (no height): con letra grande del sistema el chip crece en vez de cortar el texto.
    minHeight: 36,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
    borderColor: COLOR.borde,
    backgroundColor: COLOR.tarjeta,
  },
  suave: { backgroundColor: COLOR.primarioSuave, borderColor: COLOR.primario },
  solido: { backgroundColor: COLOR.primario, borderColor: COLOR.primario },
  texto: { ...FUENTE.normal, fontSize: TAMANO.secundario },
});
