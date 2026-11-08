// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/BloqueFicha.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El recuadro con título que envuelve cada bloque de la ficha (Ubicación, Sobre este alojamiento, Políticas…).
// PARA QUÉ SIRVE: Que todos los bloques se vean iguales y la ficha tenga un orden claro en lugar de datos sueltos.
// SIN ÉL: Cada bloque tendría su propio borde, espacio y tamaño de título.
// NO VA AQUÍ: Datos: solo dibuja el recuadro y lo que le pongan dentro.
// ======================================================================

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';

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

const estilos = StyleSheet.create({
  caja: { gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.texto, flexShrink: 1 },
  derecha: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
