// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaExplorar.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla de inicio (explorar alojamientos).
// PARA QUÉ SIRVE: Que PantallaExplorar.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaExplorar.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { padding: ESPACIO.l, gap: ESPACIO.xl, paddingBottom: ESPACIO.xl },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, lineHeight: 30, color: COLOR.texto },
  avisoCache: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.avisoOscuro },

  centro: { alignItems: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.xxl },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
  vacio: { alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.xl, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  vacioTitulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto, textAlign: 'center' },

  seccionTitulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, flexShrink: 1 },
  seccionTexto: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  // Las tarjetas llegan hasta el borde de la pantalla al deslizar; flexGrow 0 evita que el carrusel crezca hacia abajo.
  carrusel: { marginHorizontal: -ESPACIO.l, flexGrow: 0 },
  carruselContenido: { paddingHorizontal: ESPACIO.l },
});
