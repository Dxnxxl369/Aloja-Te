// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/QrZoomModal.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente QrZoomModal.
// PARA QUÉ SIRVE: Que QrZoomModal.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de QrZoomModal.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLOR.scrim, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.xl },
  caja: { backgroundColor: COLOR.blanco, borderRadius: RADIO.tarjeta, padding: ESPACIO.xl, alignItems: 'center', gap: ESPACIO.m },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },
});
