// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/CarruselFotos.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Las fotos del alojamiento a pantalla completa, que se deslizan, con "Verificado", lugar, contador y puntos encima.
// PARA QUÉ SIRVE: Es lo primero que se ve en la ficha; hay que poder recorrer todas las fotos.
// SIN ÉL: La ficha mostraría una sola foto.
// NO VA AQUÍ: Cargar las fotos: recibe las URL.
// ======================================================================
// Con una sola foto no hay contador ni puntos; sin fotos se muestra un edificio.

import { Image } from 'expo-image';
import { Building2, Camera, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';
import { MAX_PHOTO_DOTS } from '../../constantes';
import { estilos } from './CarruselFotos.styles';

interface Props {
  fotos: string[];
  titulo: string;
  /** Texto corto del chip de abajo a la izquierda, por ejemplo "Santa Cruz". */
  lugar?: string;
  verificado?: boolean;
  alto?: number;
}

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
          // Solo se dibujan la foto actual y las vecinas; el resto se carga al acercarse.
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          renderItem={({ item, index }) => (
            <Image
              source={{ uri: item }}
              style={{ width, height: alto }}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
              recyclingKey={item}
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
          <MapPin color={COLOR.blanco} size={14} />
          <Text style={estilos.lugarTexto} numberOfLines={1}>
            {lugar}
          </Text>
        </View>
      ) : null}
      {varias ? (
        <>
          <View style={estilos.contador} pointerEvents="none" accessible accessibilityLabel={`Foto ${indice + 1} de ${fotos.length}`}>
            <Camera color={COLOR.blanco} size={14} />
            <Text style={estilos.contadorTexto}>
              {indice + 1}/{fotos.length}
            </Text>
          </View>
          <View style={estilos.puntos} pointerEvents="none">
            {fotos.slice(0, MAX_PHOTO_DOTS).map((_, i) => (
              <View key={i} style={[estilos.punto, i === Math.min(indice, MAX_PHOTO_DOTS - 1) && estilos.puntoActivo]} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
