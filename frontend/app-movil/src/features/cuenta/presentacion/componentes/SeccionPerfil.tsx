// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/SeccionPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Un grupo del perfil: un título pequeño ("Mi actividad", "Ajustes") y debajo un recuadro con sus filas.
// PARA QUÉ SIRVE: Que el perfil tenga un orden claro por temas en lugar de tarjetas sueltas.
// SIN ÉL: Cada fila tendría su propio recuadro y no se vería a qué tema pertenece.
// NO VA AQUÍ: Las filas en sí (son FilaPerfil).
// ======================================================================

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export function SeccionPerfil({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={{ gap: ESPACIO.s }}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <View style={estilos.caja}>{children}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: { ...FUENTE.semi, fontSize: TAMANO.pequeno, letterSpacing: 0.6, textTransform: 'uppercase', color: COLOR.textoSuave, paddingHorizontal: ESPACIO.xs },
  // overflow hidden: el toque de cada fila respeta las esquinas redondeadas del recuadro.
  caja: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
});
