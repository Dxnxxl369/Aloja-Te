// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/OpcionesReservaSheet.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente OpcionesReservaSheet.
// PARA QUÉ SIRVE: Que OpcionesReservaSheet.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de OpcionesReservaSheet.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLOR.scrim },
  hoja: {
    backgroundColor: COLOR.tarjeta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: ESPACIO.l,
    paddingTop: ESPACIO.m,
    gap: ESPACIO.m,
  },
  agarre: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLOR.borde },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.textoSuave },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  icono: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  opcionTitulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
});
