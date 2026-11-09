// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/FiltrosSheet.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FiltrosSheet.
// PARA QUÉ SIRVE: Que FiltrosSheet.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FiltrosSheet.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLOR.scrim },
  hoja: {
    backgroundColor: COLOR.tarjeta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: ESPACIO.l,
    paddingTop: ESPACIO.m,
    gap: ESPACIO.l,
    maxHeight: '80%',
  },
  agarre: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLOR.borde },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  grupo: { gap: ESPACIO.m },
  etiqueta: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
  acciones: { flexDirection: 'row', gap: ESPACIO.m },
});
