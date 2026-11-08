// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PanelPlan.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente PanelPlan.
// PARA QUÉ SIRVE: Que PanelPlan.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PanelPlan.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import type { EstadoPaso } from '../../domain/modelos';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

/** El color del nombre de cada paso según su estado (el actual y los hechos en texto normal; los pendientes, suaves; el fallido, en rojo). */
export const COLOR_TITULO: Record<EstadoPaso, string> = {
  PENDIENTE: COLOR.textoSuave,
  EN_CURSO: COLOR.texto,
  HECHO: COLOR.texto,
  BLOQUEADO: COLOR.textoSuave,
  FALLIDO: COLOR.errorOscuro,
};

export const estilos = StyleSheet.create({
  caja: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    gap: ESPACIO.xs,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: ESPACIO.s, paddingHorizontal: ESPACIO.xs },
  cabeceraTitulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  titulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  fila: { flexDirection: 'row', gap: ESPACIO.m, paddingHorizontal: ESPACIO.xs },
  riel: { width: 26, alignItems: 'center' },
  icono: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  conector: { flex: 1, width: 3, minHeight: 10, borderRadius: 2, backgroundColor: COLOR.borde },
  conectorHecho: { backgroundColor: COLOR.primario },
  contenido: { flex: 1, paddingTop: 2 },
  paso: { ...FUENTE.normal, fontSize: TAMANO.cuerpo },
  nota: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, marginTop: 2 },
});
