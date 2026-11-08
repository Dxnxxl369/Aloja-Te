// ======================================================================
// ARCHIVO: shared/ui/Calificacion.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La estrella con la nota y el número de reseñas ("★ 4.96 (74)").
// PARA QUÉ SIRVE: Mostrar la calificación igual en tarjetas, fotos y detalle.
// SIN ÉL: Cada tarjeta formatearía la nota a su manera.
// NO VA AQUÍ: Cómo se calcula la nota (la entrega MS-01).
// ======================================================================
// Solo muestra datos reales: sin nota no se dibuja nada (no se inventa "Sin reseñas").

import { Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from './tema';

interface Props {
  nota?: number | null;
  totalResenas?: number;
  /** "pildora": fondo blanco para ir sobre una foto o una insignia. "linea": solo el texto. */
  variante?: 'pildora' | 'linea';
}

export function Calificacion({ nota, totalResenas, variante = 'linea' }: Props) {
  if (typeof nota !== 'number') return null;
  const texto = totalResenas !== undefined ? `${nota.toFixed(2)} (${totalResenas})` : nota.toFixed(2);
  return (
    <View
      accessible
      accessibilityLabel={`Calificación ${nota.toFixed(1)} de 5${totalResenas !== undefined ? `, ${totalResenas} reseñas` : ''}`}
      style={[estilos.fila, variante === 'pildora' && estilos.pildora]}
    >
      <Star color={COLOR.aviso} fill={COLOR.aviso} size={variante === 'pildora' ? 14 : 16} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  pildora: {
    alignSelf: 'flex-start',
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFotoClaro,
  },
  texto: { fontFamily: FUENTE.semi, fontSize: 13, color: COLOR.texto },
});
