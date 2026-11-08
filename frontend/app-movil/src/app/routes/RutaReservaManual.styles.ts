// ======================================================================
// ARCHIVO: app/routes/RutaReservaManual.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos del aviso que se ve mientras cargan las habitaciones (o si fallan) en "Reservar a mano".
// PARA QUÉ SIRVE: Que RutaReservaManual.tsx solo tenga el componente.
// SIN ÉL: Los estilos estarían dentro de la ruta.
// NO VA AQUÍ: Lógica ni textos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, TAMANO } from '../../shared/ui/tema';

export const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  error: { fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
});
