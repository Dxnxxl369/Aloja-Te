// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaDatosRapidos.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FichaDatosRapidos.
// PARA QUÉ SIRVE: Que FichaDatosRapidos.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FichaDatosRapidos.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: ESPACIO.s },
  dato: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: ESPACIO.m,
    paddingHorizontal: ESPACIO.s,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  etiqueta: { ...FUENTE.normal, fontSize: TAMANO.pequeno, color: COLOR.textoSuave, marginTop: ESPACIO.xs },
  valor: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
});
