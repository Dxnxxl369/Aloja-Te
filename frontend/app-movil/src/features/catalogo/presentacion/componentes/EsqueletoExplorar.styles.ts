// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/EsqueletoExplorar.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente EsqueletoExplorar.
// PARA QUÉ SIRVE: Que EsqueletoExplorar.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de EsqueletoExplorar.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, RADIO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: ESPACIO.m },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  cuerpo: { padding: ESPACIO.m, gap: ESPACIO.s },
  filaLista: { flexDirection: 'row', gap: ESPACIO.m, padding: ESPACIO.s, backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
});
