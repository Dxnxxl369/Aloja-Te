// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaUbicacion.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FichaUbicacion.
// PARA QUÉ SIRVE: Que FichaUbicacion.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FichaUbicacion.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: ESPACIO.s },
  direccion: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 21, color: COLOR.texto },
  botonMapa: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.primarioSuave,
  },
  botonTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
});
