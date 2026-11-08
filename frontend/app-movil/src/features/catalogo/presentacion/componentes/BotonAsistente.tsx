// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BotonAsistente.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El botón redondo flotante del asistente, con la burbuja "¿Necesitas ayuda?" al lado.
// PARA QUÉ SIRVE: Llevar al usuario del explorador al asistente que arma la reserva hablando.
// SIN ÉL: El asistente solo se encontraría en la barra de pestañas.
// NO VA AQUÍ: Saber si la IA local está cargada: la pantalla lo pasa en `iaLista`.
// ======================================================================
// La burbuja dice "IA lista" solo si el modelo local está cargado; si no, "Asistente listo" (modo básico).

import { Bot, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';

interface Props {
  alPresionar: () => void;
  iaLista: boolean;
}

export function BotonAsistente({ alPresionar, iaLista }: Props) {
  const [burbuja, setBurbuja] = useState(true);
  return (
    <View style={estilos.contenedor} pointerEvents="box-none">
      {burbuja && (
        <View style={estilos.burbuja}>
          <View style={[estilos.punto, { backgroundColor: iaLista ? COLOR.exito : COLOR.aviso }]} />
          <Text style={estilos.burbujaTexto}>¿Necesitas ayuda? {iaLista ? 'IA lista' : 'Asistente listo'}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar mensaje" onPress={() => setBurbuja(false)} hitSlop={12}>
            <X color={COLOR.textoSuave} size={16} />
          </Pressable>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir el asistente de reservas"
        onPress={alPresionar}
        style={({ pressed }) => [estilos.boton, pressed && { backgroundColor: COLOR.primarioPresionado }]}
      >
        <Bot color="#fff" size={26} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: 'absolute', right: ESPACIO.l, bottom: ESPACIO.l, flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  burbuja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.s,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.tarjeta,
    ...SOMBRA_FLOTANTE,
  },
  punto: { width: 8, height: 8, borderRadius: 4 },
  burbujaTexto: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.texto },
  boton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center', ...SOMBRA_FLOTANTE },
});
