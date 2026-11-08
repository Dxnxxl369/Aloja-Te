// ======================================================================
// ARCHIVO: agente/presentacion/componentes/TarjetaOpcion.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente TarjetaOpcion.
// PARA QUÉ SIRVE: Que TarjetaOpcion.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de TarjetaOpcion.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  foto: { width: '100%', height: 150, backgroundColor: COLOR.campo },
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.s },
  // Título a la izquierda y las etiquetas a la derecha, como en el mockup "3. Elegir alojamiento".
  filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: ESPACIO.s },
  insignias: { flexDirection: 'column', alignItems: 'flex-end', gap: ESPACIO.xs },
  titulo: { flex: 1, ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.texto },
  detalle: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  nota: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.texto },
  servicios: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.xs },
  servicio: { backgroundColor: COLOR.campo, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.m, paddingVertical: 4, maxWidth: '70%' },
  servicioTexto: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
  precio: { ...FUENTE.fuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  porNoche: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  total: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  flecha: { color: COLOR.blanco, fontSize: TAMANO.subtitulo },
});
