// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/SeccionPerfil.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente SeccionPerfil.
// PARA QUÉ SIRVE: Que SeccionPerfil.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de SeccionPerfil.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  titulo: { ...FUENTE.semi, fontSize: TAMANO.pequeno, letterSpacing: 0.6, textTransform: 'uppercase', color: COLOR.textoSuave, paddingHorizontal: ESPACIO.xs },
  // overflow hidden: el toque de cada fila respeta las esquinas redondeadas del recuadro.
  caja: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
});
