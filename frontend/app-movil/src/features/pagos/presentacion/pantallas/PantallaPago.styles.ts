// ======================================================================
// ARCHIVO: pagos/presentacion/pantallas/PantallaPago.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla de pago.
// PARA QUÉ SIRVE: Que PantallaPago.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaPago.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, gap: ESPACIO.m, backgroundColor: COLOR.fondo },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
});
