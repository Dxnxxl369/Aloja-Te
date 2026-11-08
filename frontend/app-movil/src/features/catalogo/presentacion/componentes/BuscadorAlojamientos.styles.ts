// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BuscadorAlojamientos.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente BuscadorAlojamientos.
// PARA QUÉ SIRVE: Que BuscadorAlojamientos.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de BuscadorAlojamientos.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    minHeight: 52,
    paddingLeft: ESPACIO.l,
    paddingRight: ESPACIO.s,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  input: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.cuerpo, color: COLOR.texto, paddingVertical: ESPACIO.m },
  filtros: { width: 40, height: 40, borderRadius: RADIO.control, backgroundColor: COLOR.campo, alignItems: 'center', justifyContent: 'center' },
  punto: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR.primario, borderWidth: 2, borderColor: COLOR.campo },
});
