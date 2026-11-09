// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/BloqueFicha.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El recuadro con título que envuelve cada bloque de la ficha (Ubicación, Sobre este alojamiento, Políticas…).
// PARA QUÉ SIRVE: Que todos los bloques se vean iguales y la ficha tenga un orden claro en lugar de datos sueltos.
// SIN ÉL: Cada bloque tendría su propio borde, espacio y tamaño de título.
// NO VA AQUÍ: Datos: solo dibuja el recuadro y lo que le pongan dentro.
// ======================================================================

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { estilos } from './BloqueFicha.styles';

interface Props {
  titulo: string;
  /** Texto pequeño a la derecha del título, por ejemplo "6 servicios". */
  derecha?: string;
  children: ReactNode;
}

export function BloqueFicha({ titulo, derecha, children }: Props) {
  return (
    <View style={estilos.caja}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {titulo}
        </Text>
        {derecha ? <Text style={estilos.derecha}>{derecha}</Text> : null}
      </View>
      {children}
    </View>
  );
}
