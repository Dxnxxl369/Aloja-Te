// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaDetalle.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la ficha del alojamiento.
// PARA QUÉ SIRVE: Que PantallaDetalle.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaDetalle.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { paddingBottom: ESPACIO.xl },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.l },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, flexShrink: 1 },

  fallo: { gap: ESPACIO.m },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
});
