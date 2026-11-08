// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/TarjetaAsistenteIa.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La tarjeta que ofrece reservar hablando con el asistente, con su estado (IA activa o modo básico).
// PARA QUÉ SIRVE: Que quien prefiere no llenar datos a mano llegue al asistente desde la ficha.
// SIN ÉL: La ficha solo ofrecería reservar a mano.
// NO VA AQUÍ: Abrir el asistente: avisa con `alHablar`.
// ======================================================================
// El texto describe lo que el asistente hace de verdad: busca disponibilidad y arma la reserva (no negocia precios).

import { Bot, MessageSquare } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';

interface Props {
  /** true si el modelo de IA local está cargado; si no, el asistente entiende con reglas. */
  iaLista: boolean;
  alHablar: () => void;
}

export function TarjetaAsistenteIa({ iaLista, alHablar }: Props) {
  return (
    <View style={estilos.caja}>
      <View style={estilos.cabecera}>
        <View style={estilos.icono}>
          <Bot color="#fff" size={22} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={estilos.titulo}>Asistente Virtual Aloja-Te</Text>
          <Insignia texto={iaLista ? 'IA ACTIVA' : 'MODO BÁSICO'} tono={iaLista ? 'primario' : 'aviso'} />
        </View>
      </View>
      <Text style={estilos.texto}>
        ¿Prefieres que el asistente reserve por ti? Cuéntale las fechas y cuántas personas son: busca disponibilidad y arma la reserva.
      </Text>
      <Boton
        variante="contorno"
        titulo="Hablar con el Asistente IA"
        onPress={alHablar}
        iconoIzquierda={() => <MessageSquare color={COLOR.primario} size={18} />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    gap: ESPACIO.m,
    padding: ESPACIO.l,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.primarioSuave,
    borderWidth: 1,
    borderColor: COLOR.primarioBorde,
  },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  icono: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: FUENTE.semi, fontSize: 16, color: COLOR.texto },
  texto: { fontFamily: FUENTE.normal, fontSize: 14, lineHeight: 20, color: COLOR.textoSuave },
});
