// ======================================================================
// ARCHIVO: reservas/presentacion/componentes/EsqueletoReservas.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente EsqueletoReservas.
// PARA QUÉ SIRVE: Que EsqueletoReservas.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de EsqueletoReservas.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, RADIO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.m },
  filtros: { flexDirection: 'row', gap: ESPACIO.s },
  tarjeta: { gap: ESPACIO.s, padding: ESPACIO.l, backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACIO.xs },
});
