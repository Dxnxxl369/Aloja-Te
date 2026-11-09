// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PuntosEscribiendo.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Tres puntos que laten, el "está trabajando" del chat.
// PARA QUÉ SIRVE: Que el usuario vea que el agente sigue en lo suyo sin tapar la conversación con un círculo giratorio.
// SIN ÉL: El indicador de "escribiendo" sería un círculo giratorio.
// NO VA AQUÍ: Saber si el agente está ocupado: la pantalla decide cuándo mostrarlo.
// ======================================================================
// Si la persona activó "reducir movimiento" en su celular, los puntos se quedan quietos (el texto de al lado
// ya dice que el agente está trabajando).

import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useMovimientoReducido } from '../../../../shared/ui/useMovimientoReducido';
import { TYPING_DOTS } from '../../constantes';
import { estilos } from './PuntosEscribiendo.styles';

export function PuntosEscribiendo() {
  const opacidades = useRef(Array.from({ length: TYPING_DOTS.COUNT }, () => new Animated.Value(TYPING_DOTS.OPACITY_LOW))).current;
  const reducido = useMovimientoReducido();

  useEffect(() => {
    if (reducido) {
      opacidades.forEach((valor) => valor.setValue(TYPING_DOTS.OPACITY_STILL));
      return;
    }
    const animaciones = opacidades.map((valor, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * TYPING_DOTS.STEP_MS),
          Animated.timing(valor, { toValue: 1, duration: TYPING_DOTS.RISE_MS, useNativeDriver: true }),
          Animated.timing(valor, { toValue: TYPING_DOTS.OPACITY_LOW, duration: TYPING_DOTS.RISE_MS, useNativeDriver: true }),
          Animated.delay((TYPING_DOTS.COUNT - 1 - i) * TYPING_DOTS.STEP_MS),
        ]),
      ),
    );
    animaciones.forEach((a) => a.start());
    return () => animaciones.forEach((a) => a.stop());
  }, [opacidades, reducido]);

  return (
    // Decorativo: el texto de al lado ya dice qué está haciendo el agente.
    <View style={estilos.fila} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {opacidades.map((opacidad, i) => (
        <Animated.View key={i} style={[estilos.punto, { opacity: opacidad }]} />
      ))}
    </View>
  );
}
