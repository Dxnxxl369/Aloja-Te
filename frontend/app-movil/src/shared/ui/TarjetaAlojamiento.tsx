// ======================================================================
// ARCHIVO: shared/ui/TarjetaAlojamiento.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La tarjeta de un alojamiento del explorador: versión "destacada" (grande) y versión "lista" (compacta).
// PARA QUÉ SIRVE: Que "Destacados" y "Más alojamientos" se vean como en el mockup y se arreglen en un solo lugar.
// SIN ÉL: El explorador dibujaría las dos tarjetas por su cuenta.
// NO VA AQUÍ: Cargar los alojamientos ni navegar: recibe los datos ya listos y avisa con `alVer` y `alReservar`.
// ======================================================================
// Solo muestra datos reales: si falta foto, nota, descripción, anfitrión o precio, esa parte no se dibuja.
// `DatosTarjetaAlojamiento` es el modelo de la vista; el feature que la use lo arma desde su dominio.

import { ArrowRight, Building2, MapPin } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from './Boton';
import { Calificacion } from './Calificacion';
import { Insignia } from './Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from './tema';
import { Verificado } from './Verificado';

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
  alVer: () => void;
  /** Solo la variante destacada muestra el botón "Reservar". */
  alReservar?: () => void;
  /** Ancho fijo (para un carrusel horizontal); sin él la tarjeta ocupa todo el ancho. */
  ancho?: number;
}

/** "480" si es entero, "480.50" si tiene centavos. */
export function formatearPrecio(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function ubicacion(d: DatosTarjetaAlojamiento): string | undefined {
  const partes = [d.ciudad, d.departamento].filter((p): p is string => !!p && p.trim().length > 0);
  // "La Paz, La Paz" no aporta nada: se quita el repetido.
  const unicas = partes.filter((p, i) => partes.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i);
  return unicas.length > 0 ? unicas.join(', ') : undefined;
}

function Foto({ url, titulo, estilo }: { url?: string; titulo: string; estilo: object }) {
  if (url) {
    return <Image source={{ uri: url }} style={estilo} accessibilityLabel={`Foto de ${titulo}`} resizeMode="cover" />;
  }
  return (
    <View style={[estilo, estilos.sinFoto]}>
      <Building2 color={COLOR.primario} size={36} strokeWidth={1.5} />
    </View>
  );
}

export function TarjetaAlojamiento({ datos, variante, alVer, alReservar, ancho }: Props) {
  return variante === 'destacada' ? (
    <Destacada datos={datos} alVer={alVer} alReservar={alReservar} ancho={ancho} />
  ) : (
    <EnLista datos={datos} alVer={alVer} ancho={ancho} />
  );
}

function Destacada({ datos, alVer, alReservar, ancho }: Omit<Props, 'variante'>) {
  const lugar = ubicacion(datos);
  return (
    <View style={[estilos.tarjeta, ancho !== undefined && { width: ancho }]}>
      <View>
        <Foto url={datos.fotoUrl} titulo={datos.titulo} estilo={estilos.fotoGrande} />
        {typeof datos.calificacion === 'number' && (
          <View style={estilos.notaSobreFoto}>
            <Calificacion nota={datos.calificacion} totalResenas={datos.totalResenas} variante="pildora" />
          </View>
        )}
        {lugar && (
          <View style={estilos.lugarSobreFoto}>
            <MapPin color="#fff" size={14} />
            <Text style={estilos.lugarTexto} numberOfLines={1}>
              {lugar}
            </Text>
          </View>
        )}
      </View>

      <View style={estilos.cuerpo}>
        <View style={estilos.filaTipo}>
          {datos.tipo ? <Text style={estilos.tipoMayus}>{datos.tipo.toUpperCase()}</Text> : <View />}
        </View>
        <Text style={estilos.tituloDestacada} numberOfLines={2}>
          {datos.titulo}
        </Text>
        {(datos.anfitrion || datos.verificado) && (
          <View style={estilos.filaAnfitrion}>
            {datos.anfitrion ? <Text style={estilos.suave}>Por {datos.anfitrion}</Text> : null}
            {datos.verificado ? <Verificado /> : null}
          </View>
        )}
        {datos.descripcion ? (
          <Text style={estilos.descripcion} numberOfLines={2}>
            {datos.descripcion}
          </Text>
        ) : null}

        <View style={estilos.pie}>
          {typeof datos.precioNoche === 'number' && (
            <View style={{ flexShrink: 1 }}>
              <Text style={estilos.etiquetaMayus}>TARIFA POR NOCHE</Text>
              <Text style={estilos.precioGrande}>
                Bs {formatearPrecio(datos.precioNoche)} <Text style={estilos.porNoche}>/ noche</Text>
              </Text>
            </View>
          )}
          <View style={estilos.botones}>
            <Boton variante="contorno" titulo="Ver ficha" onPress={alVer} />
            {alReservar ? (
              <Boton titulo="Reservar" onPress={alReservar} iconoDerecha={(c) => <ArrowRight color={c} size={18} />} />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function EnLista({ datos, alVer, ancho }: Omit<Props, 'variante' | 'alReservar'>) {
  const lugar = ubicacion(datos);
  const encabezado = [datos.tipo, lugar].filter(Boolean).join(' • ').toUpperCase();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${datos.titulo}`}
      onPress={alVer}
      style={({ pressed }) => [estilos.tarjetaLista, ancho !== undefined && { width: ancho }, pressed && { opacity: 0.85 }]}
    >
      <View>
        <Foto url={datos.fotoUrl} titulo={datos.titulo} estilo={estilos.fotoLista} />
        {typeof datos.calificacion === 'number' && (
          <View style={estilos.notaLista}>
            <Calificacion nota={datos.calificacion} variante="pildora" />
          </View>
        )}
      </View>
      <View style={estilos.cuerpoLista}>
        {encabezado ? (
          <Text style={estilos.encabezadoLista} numberOfLines={2}>
            {encabezado}
          </Text>
        ) : null}
        <Text style={estilos.tituloLista} numberOfLines={2}>
          {datos.titulo}
        </Text>
        {datos.descripcion ? (
          <Text style={estilos.suave} numberOfLines={1}>
            {datos.descripcion}
          </Text>
        ) : null}
        <View style={estilos.pieLista}>
          {typeof datos.precioNoche === 'number' ? (
            <Text style={estilos.precioLista}>
              Bs {formatearPrecio(datos.precioNoche)} <Text style={estilos.porNoche}>/ noche</Text>
            </Text>
          ) : (
            <View />
          )}
          <Insignia texto="Ver" tono="neutro" />
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  fotoGrande: { width: '100%', height: 200, backgroundColor: COLOR.campo },
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  notaSobreFoto: { position: 'absolute', top: ESPACIO.m, right: ESPACIO.m },
  lugarSobreFoto: {
    position: 'absolute',
    left: ESPACIO.m,
    bottom: ESPACIO.m,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.sobreFoto,
  },
  lugarTexto: { fontFamily: FUENTE.semi, fontSize: 12, color: '#fff', flexShrink: 1 },

  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.s },
  filaTipo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipoMayus: { fontFamily: FUENTE.semi, fontSize: 11, letterSpacing: 0.6, color: COLOR.textoSuave },
  tituloDestacada: { fontFamily: FUENTE.tituloFuerte, fontSize: 20, lineHeight: 26, color: COLOR.primario },
  filaAnfitrion: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: ESPACIO.s },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  descripcion: { fontFamily: FUENTE.normal, fontSize: 14, lineHeight: 20, color: COLOR.textoSuave },
  pie: { marginTop: ESPACIO.s, gap: ESPACIO.m },
  etiquetaMayus: { fontFamily: FUENTE.medio, fontSize: 11, letterSpacing: 0.8, color: COLOR.textoSuave },
  precioGrande: { fontFamily: FUENTE.tituloFuerte, fontSize: 22, color: COLOR.texto },
  porNoche: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  botones: { flexDirection: 'row', gap: ESPACIO.s, flexWrap: 'wrap' },

  tarjetaLista: {
    flexDirection: 'row',
    gap: ESPACIO.m,
    padding: ESPACIO.m,
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  fotoLista: { width: 96, height: 96, borderRadius: RADIO.control, backgroundColor: COLOR.campo },
  notaLista: { position: 'absolute', right: 4, bottom: 4 },
  cuerpoLista: { flex: 1, gap: 2 },
  encabezadoLista: { fontFamily: FUENTE.semi, fontSize: 11, letterSpacing: 0.5, color: COLOR.textoSuave },
  tituloLista: { fontFamily: FUENTE.semi, fontSize: 16, lineHeight: 21, color: COLOR.texto },
  pieLista: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACIO.xs },
  precioLista: { fontFamily: FUENTE.tituloFuerte, fontSize: 18, color: COLOR.primario },
});
