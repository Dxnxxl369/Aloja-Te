// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PuntosEscribiendo.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Tres puntos que laten, el "está trabajando" del chat.
// PARA QUÉ SIRVE: Que el usuario vea que el asistente sigue en lo suyo sin tapar la conversación con un círculo giratorio.
// SIN ÉL: El indicador de "escribiendo" sería un círculo giratorio.
// NO VA AQUÍ: Saber si el agente está ocupado: la pantalla decide cuándo mostrarlo.
// ======================================================================

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';

const PUNTOS = 3;
const PASO_MS = 160;
const SUBIDA_MS = 320;

export function PuntosEscribiendo() {
  const opacidades = useRef(Array.from({ length: PUNTOS }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animaciones = opacidades.map((valor, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * PASO_MS),
          Animated.timing(valor, { toValue: 1, duration: SUBIDA_MS, useNativeDriver: true }),
          Animated.timing(valor, { toValue: 0.3, duration: SUBIDA_MS, useNativeDriver: true }),
          Animated.delay((PUNTOS - 1 - i) * PASO_MS),
        ]),
      ),
    );
    animaciones.forEach((a) => a.start());
    return () => animaciones.forEach((a) => a.stop());
  }, [opacidades]);

  return (
    // Decorativo: el texto de al lado ya dice qué está haciendo el asistente.
    <View style={estilos.fila} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {opacidades.map((opacidad, i) => (
        <Animated.View key={i} style={[estilos.punto, { opacity: opacidad }]} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLOR.primario },
});
