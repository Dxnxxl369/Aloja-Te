// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PanelPlan.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La línea de tiempo del plan del agente: un punto por paso, unidos por una línea, con el estado de cada uno.
// PARA QUÉ SIRVE: El usuario (y el jurado) ve qué está haciendo el agente y por qué: transparencia del agente.
// SIN ÉL: El plan existiría pero no se vería.
// NO VA AQUÍ: Lógica del plan.
// ======================================================================
// Diseño: mockup "2. Agente: conversación y plan" (paso hecho = check azul, en curso = fila resaltada).

import { Bot, Circle, CircleCheck, CircleX, Lock } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE } from '../../../../shared/ui/tema';
import type { Paso } from '../../domain/modelos';
import { pasoActual } from '../etapasPlan';
import { COLOR_TITULO, estilos } from './PanelPlan.styles';

function IconoPaso({ paso }: { paso: Paso }) {
  switch (paso.estado) {
    case 'HECHO':
      return <CircleCheck color={COLOR.primario} size={22} />;
    case 'EN_CURSO':
      // El último paso (pagar) lo hace el usuario: no hay nada "cargando" en el agente.
      return paso.id === 'PAGAR' ? <Lock color={COLOR.aviso} size={20} /> : <ActivityIndicator size="small" color={COLOR.aviso} />;
    case 'FALLIDO':
      return <CircleX color={COLOR.error} size={22} />;
    case 'BLOQUEADO':
      return <Lock color={COLOR.textoSuave} size={20} />;
    case 'PENDIENTE':
      return paso.id === 'PAGAR' ? <Lock color={COLOR.textoSuave} size={20} /> : <Circle color={COLOR.borde} size={22} strokeWidth={2} />;
  }
}

export function PanelPlan({ plan }: { plan: Paso[] }) {
  return (
    <View style={estilos.caja} accessibilityLabel="Pasos del plan">
      <View style={estilos.cabecera}>
        <View style={estilos.cabeceraTitulo}>
          <Bot color={COLOR.primario} size={22} />
          <Text style={estilos.titulo}>Plan del agente</Text>
        </View>
        <Insignia texto={`Paso ${pasoActual(plan)} de ${plan.length}`} />
      </View>

      {/* Línea de tiempo: un punto por paso y una línea que los une (azul hasta donde ya se hizo). */}
      {plan.map((p, i) => {
        const ultimo = i === plan.length - 1;
        return (
          <View key={p.id} style={estilos.fila}>
            <View style={estilos.riel}>
              <View style={estilos.icono}>
                <IconoPaso paso={p} />
              </View>
              {ultimo ? null : <View style={[estilos.conector, p.estado === 'HECHO' && estilos.conectorHecho]} />}
            </View>
            <View style={[estilos.contenido, !ultimo && { paddingBottom: ESPACIO.m }]}>
              <Text style={[estilos.paso, { color: COLOR_TITULO[p.estado] }, p.estado === 'EN_CURSO' && { ...FUENTE.semi }]}>
                {p.titulo}
              </Text>
              {p.nota ? <Text style={estilos.nota}>{p.nota}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
