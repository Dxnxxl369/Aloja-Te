// ======================================================================
// ARCHIVO: shared/ui/Logo.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El logo de Aloja-Te: el sol blanco sobre un cuadrado azul.
// PARA QUÉ SIRVE: Usar la misma marca en el login y en la cabecera del explorador.
// SIN ÉL: El logo se dibujaría a mano en cada pantalla.
// NO VA AQUÍ: El nombre "Aloja-Te" ni la insignia BOLIVIA: los pone quien lo usa.
// ======================================================================

import { Sun } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { COLOR, SOMBRA_FLOTANTE } from './tema';

export function Logo({ tamano = 36 }: { tamano?: number }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Logo de Aloja-Te"
      style={[
        estilos.caja,
        { width: tamano, height: tamano, borderRadius: Math.round(tamano * 0.28) },
        tamano >= 48 && SOMBRA_FLOTANTE,
      ]}
    >
      <Sun color="#ffffff" size={Math.round(tamano * 0.6)} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
});
