// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/BloqueFicha.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente BloqueFicha.
// PARA QUÉ SIRVE: Que BloqueFicha.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de BloqueFicha.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  caja: { gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.texto, flexShrink: 1 },
  derecha: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
