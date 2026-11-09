// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PuntosEscribiendo.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente PuntosEscribiendo.
// PARA QUÉ SIRVE: Que PuntosEscribiendo.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PuntosEscribiendo.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLOR.primario },
});
