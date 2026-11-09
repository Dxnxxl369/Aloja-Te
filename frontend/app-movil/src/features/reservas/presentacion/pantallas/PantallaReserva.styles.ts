// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaReserva.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de el detalle de una reserva.
// PARA QUÉ SIRVE: Que PantallaReserva.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaReserva.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, backgroundColor: COLOR.fondo },

  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  portada: { height: 160, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  verificado: { position: 'absolute', left: ESPACIO.m, bottom: ESPACIO.m },
  lugar: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, marginTop: ESPACIO.xs },
  codigo: { position: 'absolute', right: ESPACIO.m, bottom: ESPACIO.m, backgroundColor: COLOR.blanco, borderRadius: RADIO.control, paddingHorizontal: ESPACIO.s, paddingVertical: 2 },
  codigoTexto: { ...FUENTE.semi, fontSize: TAMANO.micro, color: COLOR.textoSuave, letterSpacing: 0.5 },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.xs },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },

  cuenta: { backgroundColor: COLOR.avisoFondo, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.avisoBorde, padding: ESPACIO.l, gap: ESPACIO.m },
  cuentaCabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  cuentaIcono: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLOR.avisoFondoFuerte, alignItems: 'center', justifyContent: 'center' },
  cuentaTitulo: { flex: 1, ...FUENTE.titulo, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.avisoMuyOscuro },
  // Texto blanco: sobre el ámbar vivo daba 3.2:1; con el ámbar oscuro da 5:1.
  reloj: { backgroundColor: COLOR.avisoOscuro, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.m, paddingVertical: 4 },
  relojTexto: { ...FUENTE.fuerte, fontSize: TAMANO.secundario, color: COLOR.blanco, fontVariant: ['tabular-nums'] },
  cuentaDescripcion: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.avisoMuyOscuro },
  barra: { height: 6, borderRadius: 3, backgroundColor: COLOR.avisoBorde, overflow: 'hidden' },
  barraRelleno: { height: 6, borderRadius: 3 },

  estado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  etiquetaMayus: { ...FUENTE.medio, fontSize: TAMANO.pequeno, letterSpacing: 0.8, color: COLOR.textoSuave },
  resumen: { backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.l, gap: ESPACIO.s },
  filaPrecio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nota: { ...FUENTE.normal, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
  separador: { height: 1, backgroundColor: COLOR.borde, marginVertical: ESPACIO.xs },
  total: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.primario },

  confirmada: { alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.exitoFondo, borderWidth: 1, borderColor: COLOR.exitoBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.xl },
  confirmadaTitulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.exitoOscuro, textAlign: 'center' },
  confirmadaTexto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, color: COLOR.texto, textAlign: 'center' },
  pinCaja: { flexDirection: 'row', gap: ESPACIO.s, marginTop: ESPACIO.s },
  pinDigito: {
    width: 44,
    height: 56,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 56,
    ...FUENTE.fuerte,
    fontSize: TAMANO.titular,
    color: COLOR.texto,
    backgroundColor: COLOR.blanco,
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.exitoBorde,
    overflow: 'hidden',
  },
  confirmando: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.primarioSuave, borderWidth: 1, borderColor: COLOR.primarioBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.l },
  confirmandoTitulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.primario },
  confirmandoTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.texto, marginTop: 2 },

  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
  error: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },

  barraInferior: { padding: ESPACIO.l, gap: ESPACIO.s, backgroundColor: COLOR.tarjeta, borderTopWidth: 1, borderTopColor: COLOR.borde, ...SOMBRA_FLOTANTE },
  cancelar: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  cancelarTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
