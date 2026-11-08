// ======================================================================
// ARCHIVO: agente/presentacion/componentes/BarraProgreso.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La barra compacta de arriba del chat: "Paso N de 8", el paso actual y un panel desplegable "Actividad del asistente".
// PARA QUÉ SIRVE: Mostrar el avance de la reserva sin que el plan le quite protagonismo a la conversación.
// SIN ÉL: El plan completo ocuparía media pantalla todo el tiempo.
// NO VA AQUÍ: Lógica del plan.
// ======================================================================
// Solo muestra actividades operativas ("Buscar alojamientos", "Verificar disponibilidad"):
// nunca el razonamiento del modelo.

import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { Paso } from '../../domain/modelos';
import { PanelPlan, pasoActual } from './PanelPlan';

interface Props {
  plan: Paso[];
  abierto: boolean;
  alAlternar: () => void;
}

/** El paso que se está haciendo ahora: en curso, fallido, o el primero pendiente. */
function pasoVisible(plan: Paso[]): Paso | undefined {
  return (
    plan.find((p) => p.estado === 'EN_CURSO') ??
    plan.find((p) => p.estado === 'FALLIDO') ??
    plan.find((p) => p.estado === 'PENDIENTE') ??
    plan[plan.length - 1]
  );
}

export function BarraProgreso({ plan, abierto, alAlternar }: Props) {
  const actual = pasoVisible(plan);
  return (
    <View style={estilos.contenedor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={abierto ? 'Ocultar actividad del asistente' : 'Ver actividad del asistente'}
        accessibilityState={{ expanded: abierto }}
        onPress={alAlternar}
        style={estilos.tarjeta}
      >
        <View style={estilos.fila}>
          <View style={estilos.izquierda}>
            <ClipboardList color={COLOR.primario} size={20} />
            <Text style={estilos.titulo}>{abierto ? 'Ocultar plan' : 'Ver plan del agente'}</Text>
          </View>
          <View style={estilos.derecha}>
            <Text style={estilos.paso}>
              Paso {pasoActual(plan)} de {plan.length}
            </Text>
            {abierto ? <ChevronUp color={COLOR.primario} size={20} /> : <ChevronDown color={COLOR.primario} size={20} />}
          </View>
        </View>
        <View style={estilos.segmentos}>
          {plan.map((p) => (
            <View
              key={p.id}
              style={[
                estilos.segmento,
                p.estado === 'HECHO' && { backgroundColor: COLOR.primario },
                p.estado === 'EN_CURSO' && { backgroundColor: COLOR.aviso },
                p.estado === 'FALLIDO' && { backgroundColor: COLOR.error },
              ]}
            />
          ))}
        </View>
        {actual ? <Text style={estilos.actual}>{actual.titulo}</Text> : null}
      </Pressable>
      {abierto && <PanelPlan plan={plan} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: ESPACIO.s },
  tarjeta: {
    minHeight: 48,
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    padding: ESPACIO.m,
    gap: ESPACIO.s,
  },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  izquierda: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  derecha: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  titulo: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.primario },
  paso: { fontFamily: FUENTE.semi, fontSize: 13, color: COLOR.primario },
  segmentos: { flexDirection: 'row', gap: 4 },
  segmento: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLOR.borde },
  actual: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.textoSuave },
});
