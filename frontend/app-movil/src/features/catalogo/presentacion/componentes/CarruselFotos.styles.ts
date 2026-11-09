// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/CarruselFotos.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) del componente CarruselFotos.
// PARA QUÉ SIRVE: Que CarruselFotos.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de CarruselFotos.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  arribaIzquierda: { position: 'absolute', top: ESPACIO.m, left: ESPACIO.m },
  lugar: {
    position: 'absolute',
    left: ESPACIO.m,
    bottom: ESPACIO.xl,
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFoto,
  },
  lugarTexto: { ...FUENTE.semi, fontSize: TAMANO.pequeno, color: COLOR.blanco, flexShrink: 1 },
  contador: {
    position: 'absolute',
    right: ESPACIO.m,
    bottom: ESPACIO.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFoto,
  },
  contadorTexto: { ...FUENTE.semi, fontSize: TAMANO.pequeno, color: COLOR.blanco },
  puntos: { position: 'absolute', bottom: ESPACIO.s, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  puntoActivo: { width: 18, backgroundColor: COLOR.blanco },
});
