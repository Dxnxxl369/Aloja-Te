// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/PaymentSummary.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente PaymentSummary.
// PARA QUÉ SIRVE: Que PaymentSummary.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PaymentSummary.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, padding: ESPACIO.l, gap: ESPACIO.m, borderWidth: 1, borderColor: COLOR.borde },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  separador: { height: 1, backgroundColor: COLOR.borde },
  totalEtiqueta: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  total: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, color: COLOR.primario },
});
