// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/SeccionPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Un grupo del perfil: un título pequeño ("Mi actividad", "Ajustes") y debajo un recuadro con sus filas.
// PARA QUÉ SIRVE: Que el perfil tenga un orden claro por temas en lugar de tarjetas sueltas.
// SIN ÉL: Cada fila tendría su propio recuadro y no se vería a qué tema pertenece.
// NO VA AQUÍ: Las filas en sí (son FilaPerfil).
// ======================================================================

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './SeccionPerfil.styles';

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
