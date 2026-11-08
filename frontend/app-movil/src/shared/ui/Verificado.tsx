// ======================================================================
// ARCHIVO: shared/ui/Verificado.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La marca "Verificado" con su check azul.
// PARA QUÉ SIRVE: Que alojamientos y pagos verificados se marquen igual en toda la app.
// SIN ÉL: Cada pantalla dibujaría su propio check.
// NO VA AQUÍ: Decidir si algo está verificado: la pantalla lo decide y solo lo dibuja.
// ======================================================================

import { BadgeCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Insignia } from './Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from './tema';

interface Props {
  texto?: string;
  /**
   * "texto": check y palabra sueltos, para ir junto a un nombre.
   * "insignia": píldora azul clara.
   * "sobreFoto": píldora blanca para ir encima de una foto.
   */
  variante?: 'texto' | 'insignia' | 'sobreFoto';
}

export function Verificado({ texto = 'Verificado', variante = 'texto' }: Props) {
  if (variante === 'insignia') {
    return <Insignia texto={texto} icono={(c) => <BadgeCheck color={c} size={14} />} />;
  }
  return (
    <View
      accessible
      accessibilityLabel={texto}
      style={[estilos.fila, variante === 'sobreFoto' && estilos.sobreFoto]}
    >
      <BadgeCheck color={COLOR.primario} size={variante === 'sobreFoto' ? 14 : 16} />
      <Text style={[estilos.texto, variante === 'sobreFoto' && estilos.textoSobreFoto]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  sobreFoto: {
    alignSelf: 'flex-start',
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFotoClaro,
  },
  texto: { fontFamily: FUENTE.semi, fontSize: 13, color: COLOR.primario },
  textoSobreFoto: { fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
});
