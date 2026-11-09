// ======================================================================
// ARCHIVO: shared/ui/TarjetaAlojamiento.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La tarjeta de un alojamiento del explorador, en dos versiones compactas: "destacada" (vertical, para el carrusel) y "lista" (en fila).
// PARA QUÉ SIRVE: Que el explorador se recorra de un vistazo: foto, nombre, ciudad, nota y precio. El resto está en la ficha.
// SIN ÉL: El explorador dibujaría las tarjetas por su cuenta.
// NO VA AQUÍ: Cargar los alojamientos ni navegar: recibe los datos ya listos y avisa con `alVer`.
// ======================================================================
// Toda la tarjeta es un botón que abre la ficha. Solo muestra datos reales: si falta foto, nota, ciudad o precio,
// esa parte no se dibuja. Va envuelta en `memo` para que el carrusel no la vuelva a dibujar sin necesidad.

import { Image } from 'expo-image';
import { Building2, MapPin } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calificacion } from './Calificacion';
import { FEATURED_PHOTO_HEIGHT, LIST_PHOTO_SIZE } from './cardSizes';
import { formatearPrecio } from './dinero';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from './tema';

export interface DatosTarjetaAlojamiento {
  id: string;
  titulo: string;
  /** Tipo de propiedad: "Hotel / Hostal", "Cabaña"… */
  tipo?: string;
  ciudad?: string;
  departamento?: string;
  descripcion?: string;
  fotoUrl?: string;
  calificacion?: number | null;
  totalResenas?: number;
  /** Precio mínimo por noche, en bolivianos. */
  precioNoche?: number | null;
  /** Nombre del anfitrión, si se conoce. */
  anfitrion?: string;
  verificado?: boolean;
}

interface Props {
  datos: DatosTarjetaAlojamiento;
  variante: 'destacada' | 'lista';
  /** Se llama con los mismos `datos`. Conviene pasar siempre la misma función para que `memo` sirva. */
  alVer: (datos: DatosTarjetaAlojamiento) => void;
  /** Ancho fijo (para un carrusel horizontal); sin él la tarjeta ocupa todo el ancho. */
  ancho?: number;
}

/** Foto con caché en disco y memoria (expo-image); sin foto, un edificio. */
function Foto({ url, titulo, estilo }: { url?: string; titulo: string; estilo: object }) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={estilo}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={url}
        accessibilityLabel={`Foto de ${titulo}`}
      />
    );
  }
  return (
    <View style={[estilo, estilos.sinFoto]}>
      <Building2 color={COLOR.primario} size={32} strokeWidth={1.5} />
    </View>
  );
}

function Precio({ valor, estilo }: { valor?: number | null; estilo: object }) {
  if (typeof valor !== 'number') return null;
  return (
    <Text style={estilo}>
      Bs {formatearPrecio(valor)} <Text style={estilos.porNoche}>/ noche</Text>
    </Text>
  );
}

function etiquetaAccesible(d: DatosTarjetaAlojamiento): string {
  const partes = [d.titulo, d.ciudad, typeof d.precioNoche === 'number' ? `Bs ${formatearPrecio(d.precioNoche)} por noche` : undefined];
  return partes.filter(Boolean).join(', ');
}

function TarjetaAlojamientoBase({ datos, variante, alVer, ancho }: Props) {
  const ciudad = datos.ciudad?.trim();
  const sobre = typeof datos.calificacion === 'number';

  if (variante === 'destacada') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={etiquetaAccesible(datos)}
        onPress={() => alVer(datos)}
        style={({ pressed }) => [estilos.tarjeta, ancho !== undefined && { width: ancho }, pressed && { opacity: 0.9 }]}
      >
        <View>
          <Foto url={datos.fotoUrl} titulo={datos.titulo} estilo={estilos.fotoCompacta} />
          {sobre ? (
            <View style={estilos.notaSobreFoto}>
              <Calificacion nota={datos.calificacion} totalResenas={datos.totalResenas} variante="pildora" />
            </View>
          ) : null}
        </View>
        <View style={estilos.cuerpo}>
          <Text style={estilos.titulo} numberOfLines={2}>
            {datos.titulo}
          </Text>
          {ciudad ? (
            <View style={estilos.filaLugar}>
              <MapPin color={COLOR.textoSuave} size={14} />
              <Text style={estilos.lugar} numberOfLines={1}>
                {ciudad}
              </Text>
            </View>
          ) : null}
          <Precio valor={datos.precioNoche} estilo={estilos.precio} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiquetaAccesible(datos)}
      onPress={() => alVer(datos)}
      style={({ pressed }) => [estilos.tarjetaLista, ancho !== undefined && { width: ancho }, pressed && { opacity: 0.9 }]}
    >
      <Foto url={datos.fotoUrl} titulo={datos.titulo} estilo={estilos.fotoLista} />
      <View style={estilos.cuerpoLista}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {datos.titulo}
        </Text>
        {ciudad ? (
          <Text style={estilos.lugar} numberOfLines={1}>
            {ciudad}
          </Text>
        ) : null}
        <View style={estilos.pieLista}>
          <Calificacion nota={datos.calificacion} />
          <Precio valor={datos.precioNoche} estilo={estilos.precio} />
        </View>
      </View>
    </Pressable>
  );
}

export const TarjetaAlojamiento = memo(TarjetaAlojamientoBase);

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  fotoCompacta: { width: '100%', height: FEATURED_PHOTO_HEIGHT, backgroundColor: COLOR.campo },
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  notaSobreFoto: { position: 'absolute', top: ESPACIO.s, right: ESPACIO.s },
  cuerpo: { padding: ESPACIO.m, gap: ESPACIO.xs },

  titulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.texto },
  filaLugar: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  lugar: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, flexShrink: 1 },
  precio: { ...FUENTE.fuerte, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  porNoche: { ...FUENTE.normal, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },

  tarjetaLista: {
    flexDirection: 'row',
    gap: ESPACIO.m,
    padding: ESPACIO.s,
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  fotoLista: { width: LIST_PHOTO_SIZE, height: LIST_PHOTO_SIZE, borderRadius: RADIO.control, backgroundColor: COLOR.campo },
  cuerpoLista: { flex: 1, gap: 2, justifyContent: 'center' },
  pieLista: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.s, marginTop: 2 },
});
