// ======================================================================
// ARCHIVO: shared/ui/Esqueleto.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Un bloque gris que late suavemente: la "sombra" de un texto, una foto o una tarjeta que aún no llegó.
// PARA QUÉ SIRVE: Mostrar la forma de lo que va a aparecer mientras carga, en vez de un círculo girando en una pantalla vacía.
// SIN ÉL: Cada pantalla mostraría un círculo de carga y el contenido "saltaría" al llegar.
// NO VA AQUÍ: La forma de cada pantalla: cada una arma su esqueleto juntando bloques.
// ======================================================================
// Si la persona activó "reducir movimiento", el bloque se queda quieto.

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { COLOR, RADIO } from './tema';
import { useMovimientoReducido } from './useMovimientoReducido';

const OPACIDAD_ALTA = 1;
const OPACIDAD_BAJA = 0.45;
const MEDIO_CICLO_MS = 700;

interface Props {
  ancho?: DimensionValue;
  alto: number;
  radio?: number;
  estilo?: StyleProp<ViewStyle>;
}

export function Esqueleto({ ancho = '100%', alto, radio = RADIO.control, estilo }: Props) {
  const opacidad = useRef(new Animated.Value(OPACIDAD_ALTA)).current;
  const reducido = useMovimientoReducido();

  useEffect(() => {
    if (reducido) {
      opacidad.setValue(OPACIDAD_ALTA);
      return;
    }
    const latido = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: OPACIDAD_BAJA, duration: MEDIO_CICLO_MS, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: OPACIDAD_ALTA, duration: MEDIO_CICLO_MS, useNativeDriver: true }),
      ]),
    );
    latido.start();
    return () => latido.stop();
  }, [opacidad, reducido]);

  return <Animated.View style={[{ width: ancho, height: alto, borderRadius: radio, backgroundColor: COLOR.borde, opacity: opacidad }, estilo]} />;
}
