// ======================================================================
// ARCHIVO: agente/presentacion/componentes/PanelPlan.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La lista visible del plan del agente con el estado de cada paso.
// PARA QUÉ SIRVE: El usuario (y el jurado) ve qué está haciendo el agente y por qué: transparencia del agente.
// SIN ÉL: El plan existiría pero no se vería.
// NO VA AQUÍ: Lógica del plan.
// ======================================================================
// Diseño: mockup "2. Agente: conversación y plan" (paso hecho = check azul, en curso = fila resaltada).

import { Bot, Circle, CircleCheck, CircleX, Lock } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { EstadoPaso, Paso } from '../../domain/modelos';

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

const COLOR_TITULO: Record<EstadoPaso, string> = {
  PENDIENTE: COLOR.textoSuave,
  EN_CURSO: COLOR.texto,
  HECHO: COLOR.texto,
  BLOQUEADO: COLOR.textoSuave,
  FALLIDO: COLOR.error,
};

/** "Paso N de 8": los pasos hechos más el que está en curso. */
export function pasoActual(plan: Paso[]): number {
  const hechos = plan.filter((p) => p.estado === 'HECHO').length;
  return Math.min(plan.length, hechos + 1);
}

export function PanelPlan({ plan }: { plan: Paso[] }) {
  return (
    <View style={estilos.caja} accessibilityLabel="Plan del agente">
      <View style={estilos.cabecera}>
        <View style={estilos.cabeceraTitulo}>
          <Bot color={COLOR.primario} size={22} />
          <Text style={estilos.titulo}>Plan del agente</Text>
        </View>
        <Insignia texto={`Paso ${pasoActual(plan)} de ${plan.length}`} />
      </View>

      {plan.map((p) => (
        <View key={p.id} style={[estilos.fila, p.estado === 'EN_CURSO' && p.id !== 'PAGAR' && estilos.filaActiva]}>
          <View style={estilos.icono}>
            <IconoPaso paso={p} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={estilos.filaTitulo}>
              <Text style={[estilos.paso, { color: COLOR_TITULO[p.estado] }, p.estado === 'EN_CURSO' && { fontFamily: FUENTE.semi }]}>
                {p.titulo}
              </Text>
            </View>
            {p.nota ? <Text style={estilos.nota}>{p.nota}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    gap: ESPACIO.xs,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: ESPACIO.s, paddingHorizontal: ESPACIO.xs },
  cabeceraTitulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  titulo: { fontFamily: FUENTE.semi, fontSize: 16, color: COLOR.texto },
  fila: { flexDirection: 'row', gap: ESPACIO.m, alignItems: 'center', paddingVertical: ESPACIO.s, paddingHorizontal: ESPACIO.xs, borderRadius: RADIO.control },
  filaActiva: { backgroundColor: COLOR.campo },
  icono: { width: 26, alignItems: 'center' },
  filaTitulo: { flexDirection: 'row', alignItems: 'center' },
  paso: { fontFamily: FUENTE.normal, fontSize: 15 },
  nota: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.textoSuave, marginTop: 2 },
});
