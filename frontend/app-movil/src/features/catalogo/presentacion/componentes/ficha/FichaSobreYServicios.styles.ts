// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaSobreYServicios.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FichaSobreYServicios.
// PARA QUÉ SIRVE: Que FichaSobreYServicios.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FichaSobreYServicios.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  descripcion: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 22, color: COLOR.texto },
  filaServicios: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  subtitulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto, flexShrink: 1 },
  cuenta: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
