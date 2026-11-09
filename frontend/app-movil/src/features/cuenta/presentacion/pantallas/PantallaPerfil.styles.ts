// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaPerfil.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla del perfil.
// PARA QUÉ SIRVE: Que PantallaPerfil.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaPerfil.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { ESPACIO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.xl },
  salir: { marginTop: ESPACIO.s },
});
