// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ServiciosGrid.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente ServiciosGrid.
// PARA QUÉ SIRVE: Que ServiciosGrid.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de ServiciosGrid.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
  item: {
    width: '48.5%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  texto: { flex: 1, ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.texto },
  enlace: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  enlaceTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
});
