// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/CarruselFotos.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Las fotos del alojamiento a pantalla completa, que se deslizan, con "Verificado", lugar, contador y puntos encima.
// PARA QUÉ SIRVE: Es lo primero que se ve en la ficha; hay que poder recorrer todas las fotos.
// SIN ÉL: La ficha mostraría una sola foto.
// NO VA AQUÍ: Cargar las fotos: recibe las URL.
// ======================================================================
// Con una sola foto no hay contador ni puntos; sin fotos se muestra un edificio.

import { Building2, Camera, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';

interface Props {
  fotos: string[];
  titulo: string;
  /** Texto corto del chip de abajo a la izquierda, por ejemplo "Santa Cruz". */
  lugar?: string;
  verificado?: boolean;
  alto?: number;
}

/** Cuántos puntos se dibujan como máximo: más de 8 se vuelven ruido. */
const MAX_PUNTOS = 8;

export function CarruselFotos({ fotos, titulo, lugar, verificado, alto = 290 }: Props) {
  const { width } = useWindowDimensions();
  const [indice, setIndice] = useState(0);
  const varias = fotos.length > 1;

  const alTerminarDeDeslizar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndice(Math.min(Math.max(i, 0), fotos.length - 1));
  };

  return (
    <View style={{ height: alto, backgroundColor: COLOR.campo }}>
      {fotos.length > 0 ? (
        <FlatList
          data={fotos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(url, i) => `${i}-${url}`}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={alTerminarDeDeslizar}
          renderItem={({ item, index }) => (
            <Image
              source={{ uri: item }}
              style={{ width, height: alto }}
              resizeMode="cover"
              accessibilityLabel={`Foto ${index + 1} de ${fotos.length} de ${titulo}`}
            />
          )}
        />
      ) : (
        <View style={[estilos.sinFoto, { height: alto }]}>
          <Building2 color={COLOR.primario} size={56} strokeWidth={1.5} />
        </View>
      )}

      {verificado ? (
        <View style={estilos.arribaIzquierda} pointerEvents="none">
          <Verificado texto="Verificado Bolivia" variante="sobreFoto" />
        </View>
      ) : null}
      {lugar ? (
        <View style={estilos.lugar} pointerEvents="none">
          <MapPin color="#fff" size={14} />
          <Text style={estilos.lugarTexto} numberOfLines={1}>
            {lugar}
          </Text>
        </View>
      ) : null}
      {varias ? (
        <>
          <View style={estilos.contador} pointerEvents="none" accessible accessibilityLabel={`Foto ${indice + 1} de ${fotos.length}`}>
            <Camera color="#fff" size={14} />
            <Text style={estilos.contadorTexto}>
              {indice + 1}/{fotos.length}
            </Text>
          </View>
          <View style={estilos.puntos} pointerEvents="none">
            {fotos.slice(0, MAX_PUNTOS).map((_, i) => (
              <View key={i} style={[estilos.punto, i === Math.min(indice, MAX_PUNTOS - 1) && estilos.puntoActivo]} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  arribaIzquierda: { position: 'absolute', top: ESPACIO.m, left: ESPACIO.m },
  lugar: {
    position: 'absolute',
    left: ESPACIO.m,
    bottom: ESPACIO.xl,
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFoto,
  },
  lugarTexto: { fontFamily: FUENTE.semi, fontSize: 12, color: '#fff', flexShrink: 1 },
  contador: {
    position: 'absolute',
    right: ESPACIO.m,
    bottom: ESPACIO.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFoto,
  },
  contadorTexto: { fontFamily: FUENTE.semi, fontSize: 12, color: '#fff' },
  puntos: { position: 'absolute', bottom: ESPACIO.s, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  puntoActivo: { width: 18, backgroundColor: '#fff' },
});
