// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/PaymentResultCard.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente PaymentResultCard.
// PARA QUÉ SIRVE: Que PaymentResultCard.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PaymentResultCard.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  tarjeta: { alignItems: 'center', backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, padding: ESPACIO.l, gap: ESPACIO.m, borderWidth: 1, borderColor: COLOR.borde },
  exito: { backgroundColor: COLOR.exitoFondo, borderColor: COLOR.exitoBorde },
  fallo: { backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },
  ancho: { alignSelf: 'stretch' },
  exitoTitulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.exitoOscuro },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },
});
