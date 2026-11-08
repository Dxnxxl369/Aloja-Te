// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaUbicacion.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El bloque "Ubicación": dirección, ciudad y departamento, con el botón "Ver mapa".
// PARA QUÉ SIRVE: Responder "¿dónde está?" y abrir el lugar exacto en la aplicación de mapas.
// SIN ÉL: La dirección quedaría suelta bajo el título y sin forma de llegar al mapa.
// NO VA AQUÍ: Cargar datos: recibe los campos del alojamiento.
// ======================================================================
// Datos: direccion, ciudad, departamento, latitud y longitud ← tabla alojamientos.
// El mapa se abre con las coordenadas; si no las hay, con la dirección; si tampoco hay, el botón no aparece.

import { MapPin, Navigation } from 'lucide-react-native';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';
import { BloqueFicha } from './BloqueFicha';
import { unir } from './texto';

interface Props {
  ciudad?: string;
  departamento?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

/** El destino para la app de mapas: coordenadas si las hay; si no, la dirección. null si no hay nada. */
function destinoDelMapa({ direccion, ciudad, departamento, latitud, longitud }: Props): string | null {
  if (latitud !== undefined && longitud !== undefined) return `${latitud},${longitud}`;
  return direccion ? unir([direccion, ciudad, departamento], ', ') : null;
}

export function FichaUbicacion(props: Props) {
  const lugar = unir([props.direccion, props.ciudad, props.departamento], ', ');
  if (!lugar) return null;
  const destino = destinoDelMapa(props);

  const abrirMapa = () => {
    if (!destino) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`).catch(() =>
      Alert.alert('No se pudo abrir el mapa', 'Revisa que tengas una aplicación de mapas o un navegador.'),
    );
  };

  return (
    <BloqueFicha titulo="Ubicación">
      <View style={estilos.fila}>
        <MapPin color={COLOR.primario} size={18} />
        <Text style={estilos.direccion}>{lugar}</Text>
      </View>
      {destino ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Ver en el mapa"
          onPress={abrirMapa}
          style={({ pressed }) => [estilos.botonMapa, pressed && { opacity: 0.8 }]}
        >
          <Navigation color={COLOR.primario} size={16} />
          <Text style={estilos.botonTexto}>Ver mapa</Text>
        </Pressable>
      ) : null}
    </BloqueFicha>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: ESPACIO.s },
  direccion: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 21, color: COLOR.texto },
  botonMapa: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.primarioSuave,
  },
  botonTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
});
