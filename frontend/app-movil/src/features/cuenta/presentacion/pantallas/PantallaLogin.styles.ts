// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaLogin.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla de inicio de sesión.
// PARA QUÉ SIRVE: Que PantallaLogin.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaLogin.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  contenido: { paddingHorizontal: ESPACIO.xl, gap: ESPACIO.xl, flexGrow: 1 },

  marca: { alignItems: 'center', gap: ESPACIO.s },
  nombre: { ...FUENTE.tituloFuerte, fontSize: TAMANO.display, color: COLOR.texto, marginTop: ESPACIO.s },
  lema: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },

  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: 20, padding: ESPACIO.xl, ...SOMBRA_FLOTANTE },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, color: COLOR.texto, marginBottom: ESPACIO.xs },
  etiqueta: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.texto, marginTop: ESPACIO.m, marginBottom: ESPACIO.s },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    minHeight: 52,
    paddingHorizontal: ESPACIO.l,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.campo,
  },
  input: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.cuerpo, color: COLOR.texto, paddingVertical: ESPACIO.m },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, marginTop: ESPACIO.m },

  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.textoSuave, letterSpacing: 0.3 },
});
