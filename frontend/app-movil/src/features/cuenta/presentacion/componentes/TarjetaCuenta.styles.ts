// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/TarjetaCuenta.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente TarjetaCuenta.
// PARA QUÉ SIRVE: Que TarjetaCuenta.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de TarjetaCuenta.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.l, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  inicial: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, color: COLOR.blanco },
  datos: { flex: 1, gap: 2 },
  nombre: { ...FUENTE.tituloFuerte, fontSize: TAMANO.subtitulo, color: COLOR.texto },
  email: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
