// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaReservaManual.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla de reservar a mano.
// PARA QUÉ SIRVE: Que PantallaReservaManual.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaReservaManual.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { padding: ESPACIO.l, gap: ESPACIO.xl, paddingBottom: ESPACIO.xxl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACIO.m, padding: ESPACIO.xl, backgroundColor: COLOR.fondo },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, lineHeight: 30, color: COLOR.texto },
  tituloSeccion: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'left' },
  valor: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  grupo: { gap: ESPACIO.m },

  unidad: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  unidadElegida: { borderColor: COLOR.primario, backgroundColor: COLOR.primarioSuave },
  unidadNombre: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  unidadPrecio: { ...FUENTE.fuerte, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLOR.borde, alignItems: 'center', justifyContent: 'center' },
  radioElegido: { borderColor: COLOR.primario },
  radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR.primario },

  filaFechas: { flexDirection: 'row', gap: ESPACIO.m },
  contador: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: ESPACIO.m, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  contadorTexto: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  contadorValor: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  botonesContador: { flexDirection: 'row', gap: ESPACIO.s },
  paso: { width: 44, height: 44, borderRadius: RADIO.control, backgroundColor: COLOR.campo, alignItems: 'center', justifyContent: 'center' },

  resumen: { gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.campo },
  filaResumen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  estado: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  estadoTexto: { flex: 1, ...FUENTE.medio, fontSize: TAMANO.secundario },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro },
  cola: { gap: ESPACIO.m, alignItems: 'center', padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.avisoFondo, borderWidth: 1, borderColor: COLOR.avisoBorde },
  colaTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.texto, textAlign: 'center' },
});
