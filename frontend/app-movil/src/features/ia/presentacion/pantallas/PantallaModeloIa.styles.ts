// ======================================================================
// ARCHIVO: ia/presentacion/pantallas/PantallaModeloIa.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla del agente inteligente.
// PARA QUÉ SIRVE: Que PantallaModeloIa.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaModeloIa.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, padding: ESPACIO.l, gap: ESPACIO.m },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  icono: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.textoSuave },
  requisitos: { gap: ESPACIO.s, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  requisitoTexto: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.textoSuave },
  aviso: { backgroundColor: COLOR.avisoFondo, borderColor: COLOR.avisoBorde },
  avisoTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.avisoMuyOscuro },
  filaProgreso: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  progresoTexto: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  barra: { height: 8, borderRadius: 4, backgroundColor: COLOR.borde, overflow: 'hidden' },
  barraRelleno: { height: 8, borderRadius: 4, backgroundColor: COLOR.primario },
  fallo: { backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },
  falloTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.errorOscuro },
});
