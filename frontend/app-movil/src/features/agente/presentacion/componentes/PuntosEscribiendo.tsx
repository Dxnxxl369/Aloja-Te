// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PuntosEscribiendo.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Tres puntos que laten, el "está trabajando" del chat.
// PARA QUÉ SIRVE: Que el usuario vea que el agente sigue en lo suyo sin tapar la conversación con un círculo giratorio.
// SIN ÉL: El indicador de "escribiendo" sería un círculo giratorio.
// NO VA AQUÍ: Saber si el agente está ocupado: la pantalla decide cuándo mostrarlo.
// ======================================================================
// Si la persona activó "reducir movimiento" en su celular, los puntos se quedan quietos (el texto de al lado
// ya dice que el agente está trabajando).

import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';

const PUNTOS = 3;
const PASO_MS = 160;
const SUBIDA_MS = 320;
const OPACIDAD_BAJA = 0.3;
const OPACIDAD_QUIETA = 0.6;

/** true si el sistema pide menos movimiento. Se actualiza si la persona lo cambia con la app abierta. */
function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (v) => vivo && setReducido(v),
      () => undefined,
    );
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);
    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);
  return reducido;
}

export function PuntosEscribiendo() {
  const opacidades = useRef(Array.from({ length: PUNTOS }, () => new Animated.Value(OPACIDAD_BAJA))).current;
  const reducido = useMovimientoReducido();

  useEffect(() => {
    if (reducido) {
      opacidades.forEach((valor) => valor.setValue(OPACIDAD_QUIETA));
      return;
    }
    const animaciones = opacidades.map((valor, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * PASO_MS),
          Animated.timing(valor, { toValue: 1, duration: SUBIDA_MS, useNativeDriver: true }),
          Animated.timing(valor, { toValue: OPACIDAD_BAJA, duration: SUBIDA_MS, useNativeDriver: true }),
          Animated.delay((PUNTOS - 1 - i) * PASO_MS),
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

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLOR.primario },
});
