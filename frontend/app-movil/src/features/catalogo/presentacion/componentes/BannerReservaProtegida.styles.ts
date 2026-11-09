// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BannerReservaProtegida.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente BannerReservaProtegida.
// PARA QUÉ SIRVE: Que BannerReservaProtegida.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de BannerReservaProtegida.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    padding: ESPACIO.l,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.primario,
  },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  tituloTexto: { ...FUENTE.fuerte, fontSize: TAMANO.secundario, letterSpacing: 0.8, color: COLOR.blanco },
  texto: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.primarioSuave },
  qr: { width: 48, height: 48, borderRadius: RADIO.control, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
