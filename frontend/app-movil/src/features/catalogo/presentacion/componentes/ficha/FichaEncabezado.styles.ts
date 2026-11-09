// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaEncabezado.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente FichaEncabezado.
// PARA QUÉ SIRVE: Que FichaEncabezado.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de FichaEncabezado.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  filaTipo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  tipo: { ...FUENTE.semi, fontSize: TAMANO.micro, letterSpacing: 0.6, color: COLOR.primario, flexShrink: 1 },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, lineHeight: 30, color: COLOR.texto },
});
