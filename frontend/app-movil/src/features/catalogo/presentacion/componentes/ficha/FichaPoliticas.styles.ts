// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaPoliticas.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FichaPoliticas.
// PARA QUÉ SIRVE: Que FichaPoliticas.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FichaPoliticas.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, FUENTE, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 22, color: COLOR.texto },
  enlace: { minHeight: 44, justifyContent: 'center' },
  enlaceTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
});
