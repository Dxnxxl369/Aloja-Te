// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/QrPaymentCard.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente QrPaymentCard.
// PARA QUÉ SIRVE: Que QrPaymentCard.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de QrPaymentCard.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  tarjeta: { alignItems: 'center', backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, padding: ESPACIO.l, gap: ESPACIO.m, borderWidth: 1, borderColor: COLOR.borde },
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto, textAlign: 'center' },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },
  aviso: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.avisoOscuro, textAlign: 'center' },
  ancho: { alignSelf: 'stretch' },

  iconoQr: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  marcoQr: { padding: ESPACIO.m, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.campo, borderWidth: 1, borderColor: COLOR.primarioBorde },
  fondoQr: { padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: COLOR.blanco },
  esquina: { position: 'absolute', width: 22, height: 22, borderColor: COLOR.primario },
  arribaIzquierda: { top: 4, left: 4, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  arribaDerecha: { top: 4, right: 4, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  abajoIzquierda: { bottom: 4, left: 4, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  abajoDerecha: { bottom: 4, right: 4, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  ampliar: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs, minHeight: 44 },
  ampliarTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },

  glosa: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, minHeight: 44, backgroundColor: COLOR.campo, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.s },
  glosaTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  glosaValor: { ...FUENTE.fuerte, color: COLOR.texto },
  copiado: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.exitoOscuro },

  vencido: { alignSelf: 'stretch', alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.errorFondo, borderWidth: 1, borderColor: COLOR.errorBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.l },
  vencidoTitulo: { ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.errorOscuro },

  espera: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  esperaTexto: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.texto },
  expira: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  expiraTiempo: { ...FUENTE.fuerte, color: COLOR.texto },
});
