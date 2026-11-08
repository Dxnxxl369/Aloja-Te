// ======================================================================
// ARCHIVO: shared/ui/BarraReserva.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La barra fija de abajo con el precio a la izquierda y el botón principal a la derecha.
// PARA QUÉ SIRVE: Que "Reservar" y "Pagar ahora" estén siempre al alcance del pulgar, como en el mockup.
// SIN ÉL: Cada pantalla armaría su barra y olvidaría la zona segura del celular.
// NO VA AQUÍ: Qué pasa al tocar el botón: solo avisa con `alPresionar`.
// ======================================================================
// Sin `precio` ni `etiquetaPrecio`, el botón ocupa todo el ancho (caso de "Pagar ahora").

import { Bot } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from './Boton';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from './tema';

interface Props {
  titulo: string;
  alPresionar: () => void;
  deshabilitado?: boolean;
  cargando?: boolean;
  /** Número ya formateado, por ejemplo "480". */
  precio?: string;
  /** Texto pequeño junto al precio, por ejemplo "/ noche". */
  unidadPrecio?: string;
  /** Línea pequeña bajo el precio, por ejemplo "Impuestos incluidos". */
  nota?: ReactNode;
  iconoDerecha?: (color: string) => ReactNode;
  /** Si se pasa, aparece el botón del asistente IA junto al botón principal. */
  alAsistente?: () => void;
}

export function BarraReserva({
  titulo,
  alPresionar,
  deshabilitado,
  cargando,
  precio,
  unidadPrecio,
  nota,
  iconoDerecha,
  alAsistente,
}: Props) {
  const insets = useSafeAreaInsets();
  const conPrecio = precio !== undefined;
  return (
    <View style={[estilos.barra, { paddingBottom: ESPACIO.m + insets.bottom }]}>
      {conPrecio && (
        <View style={estilos.precioCaja}>
          <Text style={estilos.precio} numberOfLines={1}>
            Bs {precio}
            {unidadPrecio ? <Text style={estilos.unidad}> {unidadPrecio}</Text> : null}
          </Text>
          {nota ? <View style={estilos.nota}>{typeof nota === 'string' ? <Text style={estilos.notaTexto}>{nota}</Text> : nota}</View> : null}
        </View>
      )}
      {alAsistente && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hablar con el asistente de IA"
          onPress={alAsistente}
          style={({ pressed }) => [estilos.asistente, pressed && { backgroundColor: '#dbeafe' }]}
        >
          <Bot color={COLOR.primario} size={22} />
        </Pressable>
      )}
      <View style={conPrecio ? estilos.botonConPrecio : { flex: 1 }}>
        <Boton titulo={titulo} onPress={alPresionar} deshabilitado={deshabilitado} cargando={cargando} iconoDerecha={iconoDerecha} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    paddingHorizontal: ESPACIO.l,
    paddingTop: ESPACIO.m,
    backgroundColor: COLOR.tarjeta,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  precioCaja: { flex: 1, minWidth: 0 },
  precio: { fontFamily: FUENTE.tituloFuerte, fontSize: 22, color: COLOR.texto },
  unidad: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.textoSuave },
  nota: { marginTop: 2 },
  notaTexto: { fontFamily: FUENTE.medio, fontSize: 11, color: COLOR.primario },
  asistente: {
    width: 48,
    height: 48,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonConPrecio: { minWidth: 140 },
});
