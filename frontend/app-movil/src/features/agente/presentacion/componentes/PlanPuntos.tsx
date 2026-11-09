// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PlanPuntos.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El avance del agente como cuatro puntos unidos por líneas (Pedido → Opciones → Confirmar → Pagar) y, al tocarlo, la línea de tiempo con los 8 pasos.
// PARA QUÉ SIRVE: Ver de un vistazo en qué etapa va la reserva, sin que el plan le quite lugar a la conversación.
// SIN ÉL: El usuario no sabría qué está haciendo el agente ni cuánto falta.
// NO VA AQUÍ: Lógica de las etapas (es etapasPlan.ts) ni del plan.
// ======================================================================
// Punto hecho = azul con check; actual = anillo azul; fallido = rojo con X; pendiente = gris. La línea entre dos puntos es azul
// cuando la etapa de la izquierda ya está hecha. Solo muestra actividades operativas, nunca el razonamiento del modelo.

import { Check, X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';
import type { Paso } from '../../domain/modelos';
import type { Etapa } from '../etapasPlan';
import { etapasDelPlan, pasoVisible } from '../etapasPlan';
import { PanelPlan } from './PanelPlan';
import { estilos } from './PlanPuntos.styles';

interface Props {
  plan: Paso[];
  abierto: boolean;
  alAlternar: () => void;
}

function Punto({ estado }: { estado: Etapa['estado'] }) {
  if (estado === 'HECHA') {
    return (
      <View style={[estilos.punto, { backgroundColor: COLOR.primario, borderColor: COLOR.primario }]}>
        <Check color={COLOR.blanco} size={16} strokeWidth={3} />
      </View>
    );
  }
  if (estado === 'FALLIDA') {
    return (
      <View style={[estilos.punto, { backgroundColor: COLOR.error, borderColor: COLOR.error }]}>
        <X color={COLOR.blanco} size={16} strokeWidth={3} />
      </View>
    );
  }
  if (estado === 'ACTUAL') {
    return (
      <View style={[estilos.punto, { borderColor: COLOR.primario, borderWidth: 3 }]}>
        <View style={estilos.centroActual} />
      </View>
    );
  }
  return <View style={estilos.punto} />;
}

export function PlanPuntos({ plan, abierto, alAlternar }: Props) {
  const etapas = etapasDelPlan(plan);
  const actual = pasoVisible(plan);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Avance del agente. ${actual ? actual.titulo : 'Todo listo'}. ${abierto ? 'Ocultar' : 'Ver'} los pasos`}
        accessibilityState={{ expanded: abierto }}
        onPress={alAlternar}
        style={estilos.caja}
      >
        <View style={estilos.fila}>
          {etapas.map((e, i) => {
            const anterior = etapas[i - 1];
            const lineaIzquierda = anterior?.estado === 'HECHA';
            const lineaDerecha = e.estado === 'HECHA' && i < etapas.length - 1;
            return (
              <View key={e.titulo} style={estilos.etapa}>
                <View style={estilos.puntoFila}>
                  <View style={[estilos.linea, i === 0 && estilos.sinLinea, lineaIzquierda && estilos.lineaHecha]} />
                  <Punto estado={e.estado} />
                  <View style={[estilos.linea, i === etapas.length - 1 && estilos.sinLinea, lineaDerecha && estilos.lineaHecha]} />
                </View>
                <Text
                  style={[estilos.titulo, e.estado === 'ACTUAL' && estilos.tituloActual, e.estado === 'HECHA' && estilos.tituloHecha]}
                  numberOfLines={1}
                >
                  {e.titulo}
                </Text>
              </View>
            );
          })}
        </View>
      </Pressable>

      {abierto ? (
        // Con los 8 pasos abiertos la lista puede ser larga: se desliza sin empujar el chat fuera de la pantalla.
        <ScrollView style={estilos.panel} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          <PanelPlan plan={plan} />
        </ScrollView>
      ) : null}
    </View>
  );
}
