// ======================================================================
// ARCHIVO: shared/ui/Insignia.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La etiqueta en forma de píldora (estado de la reserva, "Paso 3 de 8", "Económico").
// PARA QUÉ SIRVE: Un solo estilo de etiqueta con cuatro tonos del sistema de diseño.
// SIN ÉL: Cada pantalla dibujaría sus propias etiquetas.
// NO VA AQUÍ: Lógica de negocio.
// ======================================================================

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from './tema';

export type Tono = 'primario' | 'exito' | 'aviso' | 'error' | 'neutro';

const TONOS: Record<Tono, { texto: string; fondo: string; borde: string }> = {
  primario: { texto: COLOR.primario, fondo: COLOR.primarioSuave, borde: '#bfdbfe' },
  exito: { texto: COLOR.exitoOscuro, fondo: COLOR.exitoFondo, borde: COLOR.exitoBorde },
  aviso: { texto: COLOR.avisoOscuro, fondo: COLOR.avisoFondo, borde: COLOR.avisoBorde },
  error: { texto: COLOR.errorOscuro, fondo: COLOR.errorFondo, borde: COLOR.errorBorde },
  neutro: { texto: COLOR.textoSuave, fondo: COLOR.fondo, borde: COLOR.borde },
};

interface Props {
  texto: string;
  tono?: Tono;
  /** Recibe el color del texto para que el icono combine con el tono. */
  icono?: (color: string) => ReactNode;
}

export function Insignia({ texto, tono = 'primario', icono }: Props) {
  const t = TONOS[tono];
  return (
    <View style={[estilos.caja, { backgroundColor: t.fondo, borderColor: t.borde }]}>
      {icono?.(t.texto)}
      <Text style={[estilos.texto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
  },
  texto: { ...FUENTE.semi, fontSize: TAMANO.micro, letterSpacing: 0.4 },
});
