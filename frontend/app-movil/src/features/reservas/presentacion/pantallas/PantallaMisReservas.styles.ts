// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaMisReservas.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la lista "Mis reservas".
// PARA QUÉ SIRVE: Que PantallaMisReservas.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaMisReservas.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.m, paddingBottom: ESPACIO.xxl, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, gap: ESPACIO.m, backgroundColor: COLOR.fondo },
  filtrosScroll: { flexGrow: 0 },
  filtros: { gap: ESPACIO.s, alignItems: 'center' },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, padding: ESPACIO.l, gap: ESPACIO.s },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.s },
  titulo: { flex: 1, ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  fechas: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  fechasTexto: { flexShrink: 1, ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.texto },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACIO.xs },
  total: { ...FUENTE.tituloFuerte, fontSize: TAMANO.subtitulo, color: COLOR.primario },
  plazo: { gap: ESPACIO.s, padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: COLOR.avisoFondo, borderWidth: 1, borderColor: COLOR.avisoBorde },
  plazoTexto: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  plazoTitulo: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.avisoMuyOscuro, fontVariant: ['tabular-nums'] },
  vencida: { padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: COLOR.errorFondo, borderWidth: 1, borderColor: COLOR.errorBorde },
  vencidaTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro },
  pin: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.exitoFondo, borderRadius: RADIO.control, padding: ESPACIO.s },
  pinTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.exitoOscuro },
  vacio: { alignItems: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.xxl },
  vacioIcono: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  vacioTitulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto, textAlign: 'center' },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
});
