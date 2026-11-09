// ======================================================================
// ARCHIVO: shared/ui/FilaDato.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Una fila "etiqueta a la izquierda, valor a la derecha", con un icono opcional: "Entrada (check-in)  2026-12-10".
// PARA QUÉ SIRVE: Una sola fila para el detalle de la reserva y el resumen del pago (estaba copiada en las dos pantallas).
// SIN ÉL: Cada pantalla tendría su propia versión y se irían separando.
// NO VA AQUÍ: Qué datos mostrar ni cómo se formatean: recibe el texto ya listo.
// ======================================================================

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from './tema';

interface Props {
  etiqueta: string;
  valor: string;
  /** Icono que va antes de la etiqueta. */
  icono?: ReactNode;
  /** Color del texto de la etiqueta y del valor (por ejemplo, ámbar para un descuento). Por defecto, el texto normal. */
  color?: string;
}

export function FilaDato({ etiqueta, valor, icono, color }: Props) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.etiqueta}>
        {icono}
        <Text style={[estilos.texto, color ? { color } : null]}>{etiqueta}</Text>
      </View>
      <Text style={[estilos.valor, color ? { color } : null]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  etiqueta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  valor: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
});
