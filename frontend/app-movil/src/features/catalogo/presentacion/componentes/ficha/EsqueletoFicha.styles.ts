// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/EsqueletoFicha.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente EsqueletoFicha.
// PARA QUÉ SIRVE: Que EsqueletoFicha.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de EsqueletoFicha.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, RADIO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  caja: { gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
});
