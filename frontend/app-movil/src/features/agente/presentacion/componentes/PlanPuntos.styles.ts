// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PlanPuntos.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente PlanPuntos.
// PARA QUÉ SIRVE: Que PlanPuntos.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PlanPuntos.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

export const DIAMETRO = 28;

export const estilos = StyleSheet.create({
  caja: { paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.m },
  fila: { flexDirection: 'row' },
  etapa: { flex: 1, alignItems: 'center', gap: ESPACIO.xs },
  puntoFila: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  linea: { flex: 1, height: 3, borderRadius: 2, backgroundColor: COLOR.borde },
  lineaHecha: { backgroundColor: COLOR.primario },
  sinLinea: { backgroundColor: 'transparent' },
  punto: {
    width: DIAMETRO,
    height: DIAMETRO,
    borderRadius: DIAMETRO / 2,
    borderWidth: 2,
    borderColor: COLOR.borde,
    backgroundColor: COLOR.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroActual: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR.primario },
  titulo: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
  tituloActual: { ...FUENTE.semi, color: COLOR.primario },
  tituloHecha: { color: COLOR.texto },
  panel: { maxHeight: 340, paddingHorizontal: ESPACIO.l, paddingBottom: ESPACIO.m },
});
