// ======================================================================
// ARCHIVO: shared/ui/BarraReserva.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La barra fija de abajo con el precio a la izquierda y el botón principal a la derecha.
// PARA QUÉ SIRVE: Que "Reservar" y "Pagar ahora" estén siempre al alcance del pulgar, como en el mockup.
// SIN ÉL: Cada pantalla armaría su barra y olvidaría la zona segura del celular.
// NO VA AQUÍ: Qué pasa al tocar el botón: solo avisa con `alPresionar`.
// ======================================================================
// Sin `precio` ni `etiquetaPrecio`, el botón ocupa todo el ancho (caso de "Pagar ahora").

import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from './Boton';
import { COLOR, ESPACIO, FUENTE, SOMBRA_FLOTANTE, TAMANO } from './tema';

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
  precio: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  unidad: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  nota: { marginTop: 2 },
  notaTexto: { ...FUENTE.medio, fontSize: TAMANO.micro, color: COLOR.primario },
  botonConPrecio: { minWidth: 140 },
});
