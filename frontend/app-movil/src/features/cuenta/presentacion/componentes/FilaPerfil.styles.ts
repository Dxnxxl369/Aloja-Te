// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/FilaPerfil.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FilaPerfil.
// PARA QUÉ SIRVE: Que FilaPerfil.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FilaPerfil.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.l },
  separador: { borderBottomWidth: 1, borderBottomColor: COLOR.borde },
  icono: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  titulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  subtitulo: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 18, color: COLOR.textoSuave },
});
