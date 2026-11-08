// ======================================================================
// ARCHIVO: agente/presentacion/componentes/IndicadorModoIa.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente IndicadorModoIa.
// PARA QUÉ SIRVE: Que IndicadorModoIa.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de IndicadorModoIa.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  // Mismo tamaño y estilo que el botón de compartir de las otras cabeceras.
  boton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  botonLocal: { backgroundColor: COLOR.exitoFondoFuerte },
});
