// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/OpcionesReservaSheet.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La hoja "¿Cómo quieres reservar?" con las dos formas: por tu cuenta o con el agente.
// PARA QUÉ SIRVE: Que cada botón "Reservar" deje elegir entre llenar los datos a mano o hablar con el agente.
// SIN ÉL: "Reservar" tendría que escoger una sola forma por el usuario.
// NO VA AQUÍ: Abrir cada forma de reserva: avisa con `alManual` y `alAsistente`.
// ======================================================================

import { Bot, CalendarDays, ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './OpcionesReservaSheet.styles';

interface Props {
  visible: boolean;
  /** Nombre del alojamiento, que se muestra bajo el título. */
  titulo: string;
  alManual: () => void;
  alAsistente: () => void;
  alCerrar: () => void;
}

export function OpcionesReservaSheet({ visible, titulo, alManual, alAsistente, alCerrar }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={alCerrar}>
      <Pressable style={estilos.fondo} onPress={alCerrar} accessibilityLabel="Cerrar" />
      <View style={[estilos.hoja, { paddingBottom: ESPACIO.xl + insets.bottom }]}>
        <View style={estilos.agarre} />
        <View style={{ gap: 2 }}>
          <Text style={estilos.titulo}>¿Cómo quieres reservar?</Text>
          <Text style={estilos.suave} numberOfLines={1}>
            {titulo}
          </Text>
        </View>
        <Opcion
          Icono={CalendarDays}
          titulo="Reservar yo mismo"
          detalle="Elige la habitación, las fechas y cuántas personas son."
          alTocar={alManual}
        />
        <Opcion
          Icono={Bot}
          titulo="Reservar con el agente"
          detalle="Cuéntale tus fechas y cuántas personas son: él arma la reserva."
          alTocar={alAsistente}
        />
      </View>
    </Modal>
  );
}

function Opcion({ Icono, titulo, detalle, alTocar }: { Icono: LucideIcon; titulo: string; detalle: string; alTocar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${detalle}`}
      onPress={alTocar}
      style={({ pressed }) => [estilos.opcion, pressed && { backgroundColor: COLOR.primarioSuave }]}
    >
      <View style={estilos.icono}>
        <Icono color={COLOR.primario} size={22} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={estilos.opcionTitulo}>{titulo}</Text>
        <Text style={estilos.suave}>{detalle}</Text>
      </View>
      <ChevronRight color={COLOR.textoSuave} size={20} />
    </Pressable>
  );
}
