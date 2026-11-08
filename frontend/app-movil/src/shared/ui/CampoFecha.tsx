// ======================================================================
// ARCHIVO: shared/ui/CampoFecha.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El campo "Entrada" o "Salida": muestra la fecha elegida y abre el calendario del celular al tocarlo.
// PARA QUÉ SIRVE: Elegir fechas sin escribirlas, en Android y en iPhone.
// SIN ÉL: Habría que escribir las fechas a mano.
// NO VA AQUÍ: Reglas de reserva (fechas pasadas, máximo de noches): solo respeta la fecha mínima que se le pase.
// ======================================================================
// Android abre su diálogo de calendario; en iPhone se abre una hoja con el calendario y un botón "Listo".

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from './Boton';
import { aFecha, aTexto, formatearFecha } from './fechas';
import { COLOR, ESPACIO, FUENTE, RADIO } from './tema';

interface Props {
  etiqueta: string;
  /** 'YYYY-MM-DD'; null si todavía no se eligió. */
  valor: string | null;
  /** Fecha más temprana que se puede elegir, 'YYYY-MM-DD'. */
  minimo: string;
  alCambiar: (fecha: string) => void;
  deshabilitado?: boolean;
}

export function CampoFecha({ etiqueta, valor, minimo, alCambiar, deshabilitado }: Props) {
  const insets = useSafeAreaInsets();
  const [abierto, setAbierto] = useState(false); // la hoja de iPhone
  const fechaMinima = aFecha(minimo) ?? new Date();
  const inicial = (valor ? aFecha(valor) : null) ?? fechaMinima;
  const [borrador, setBorrador] = useState<Date>(inicial);

  const abrir = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: inicial,
        mode: 'date',
        minimumDate: fechaMinima,
        onChange: (e: DateTimePickerEvent, f?: Date) => {
          if (e.type === 'set' && f) alCambiar(aTexto(f));
        },
      });
      return;
    }
    setBorrador(inicial);
    setAbierto(true);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${valor ? formatearFecha(valor) : 'sin elegir'}`}
        disabled={deshabilitado}
        onPress={abrir}
        style={({ pressed }) => [estilos.campo, pressed && { backgroundColor: COLOR.fondo }, deshabilitado && { opacity: 0.5 }]}
      >
        <Text style={estilos.etiqueta}>{etiqueta}</Text>
        <View style={estilos.fila}>
          <Calendar color={COLOR.primario} size={18} />
          <Text style={[estilos.valor, !valor && { color: COLOR.textoSuave, fontFamily: FUENTE.normal }]} numberOfLines={1}>
            {valor ? formatearFecha(valor) : 'Elegir fecha'}
          </Text>
        </View>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
          <Pressable style={estilos.fondo} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar calendario" />
          <View style={[estilos.hoja, { paddingBottom: ESPACIO.l + insets.bottom }]}>
            <Text style={estilos.titulo}>{etiqueta}</Text>
            <DateTimePicker
              value={borrador}
              mode="date"
              display="inline"
              minimumDate={fechaMinima}
              themeVariant="light"
              locale="es-BO"
              onChange={(_e: DateTimePickerEvent, f?: Date) => f && setBorrador(f)}
            />
            <Boton
              titulo="Listo"
              onPress={() => {
                alCambiar(aTexto(borrador));
                setAbierto(false);
              }}
            />
          </View>
        </Modal>
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  campo: {
    flex: 1,
    minHeight: 64,
    gap: 4,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    justifyContent: 'center',
  },
  etiqueta: { fontFamily: FUENTE.medio, fontSize: 11, letterSpacing: 0.6, color: COLOR.textoSuave, textTransform: 'uppercase' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  valor: { flexShrink: 1, fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.texto },
  fondo: { flex: 1, backgroundColor: COLOR.scrim },
  hoja: { backgroundColor: COLOR.tarjeta, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: ESPACIO.l, gap: ESPACIO.m },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 20, color: COLOR.texto },
});
