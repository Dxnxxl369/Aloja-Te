// ======================================================================
// ARCHIVO: agente/presentacion/componentes/TarjetaOpcion.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La tarjeta de un alojamiento que ofrece el agente: foto, nombre, calificación, servicios y precio.
// PARA QUÉ SIRVE: Que el usuario compare opciones de un vistazo y elija con un toque.
// SIN ÉL: Las opciones serían solo líneas de texto.
// NO VA AQUÍ: Cómo se elige (solo avisa con `alElegir`) ni reglas de reserva.
// ======================================================================
// Solo muestra datos reales: si MS-01 no envía foto, calificación o servicios, esa parte no se dibuja.

import { Image } from 'expo-image';
import { Building2, Star, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { Opcion } from '../../domain/modelos';

interface Props {
  opcion: Opcion;
  numero: number;
  /** Noches de la estadía; null si aún no se conocen las fechas. */
  noches: number | null;
  /** Etiquetas como "Recomendada", "Económico". */
  insignias: string[];
  deshabilitado?: boolean;
  alElegir: () => void;
}

const MAX_SERVICIOS = 3;

export function TarjetaOpcion({ opcion, numero, noches, insignias, deshabilitado, alElegir }: Props) {
  const servicios = opcion.servicios ?? [];
  const total = noches ? opcion.precioNoche * noches : null;
  const tieneNota = typeof opcion.calificacion === 'number';

  return (
    <View style={estilos.tarjeta}>
      {opcion.fotoUrl ? (
        <Image
          source={{ uri: opcion.fotoUrl }}
          style={estilos.foto}
          accessibilityLabel={`Foto de ${opcion.titulo}`}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[estilos.foto, estilos.sinFoto]}>
          <Building2 color={COLOR.primario} size={40} strokeWidth={1.5} />
        </View>
      )}

      <View style={estilos.cuerpo}>
        <View style={estilos.filaTitulo}>
          <Text style={estilos.titulo} numberOfLines={2}>
            {numero}. {opcion.titulo}
          </Text>
          {insignias.length > 0 && (
            <View style={estilos.insignias}>
              {insignias.map((t) => (
                <Insignia key={t} texto={t} tono={t === 'Recomendada' ? 'exito' : 'primario'} />
              ))}
            </View>
          )}
        </View>
        <Text style={estilos.detalle}>
          {[opcion.tipoPropiedad, opcion.unidadNombre].filter(Boolean).join(' · ')} ({opcion.ciudad})
        </Text>

        <View style={estilos.fila}>
          <Star color={tieneNota ? COLOR.aviso : COLOR.textoSuave} fill={tieneNota ? COLOR.aviso : 'none'} size={16} />
          <Text style={estilos.nota}>
            {tieneNota
              ? `${(opcion.calificacion as number).toFixed(1)} · ${opcion.totalResenas ?? 0} reseña${opcion.totalResenas === 1 ? '' : 's'}`
              : 'Sin reseñas aún'}
          </Text>
          <Users color={COLOR.textoSuave} size={16} style={{ marginLeft: ESPACIO.m }} />
          <Text style={estilos.nota}>hasta {opcion.capacidad}</Text>
        </View>

        {servicios.length > 0 && (
          <View style={estilos.servicios}>
            {servicios.slice(0, MAX_SERVICIOS).map((s) => (
              <View key={s} style={estilos.servicio}>
                <Text style={estilos.servicioTexto} numberOfLines={1}>
                  {s}
                </Text>
              </View>
            ))}
            {servicios.length > MAX_SERVICIOS && (
              <View style={estilos.servicio}>
                <Text style={estilos.servicioTexto}>+{servicios.length - MAX_SERVICIOS}</Text>
              </View>
            )}
          </View>
        )}

        <View>
          <Text style={estilos.precio}>
            Bs {opcion.precioNoche.toFixed(2)} <Text style={estilos.porNoche}>por noche</Text>
          </Text>
          {total !== null && noches !== null && (
            <Text style={estilos.total}>
              Total Bs {total.toFixed(2)} por {noches} noche{noches === 1 ? '' : 's'}
            </Text>
          )}
        </View>

        <Boton
          titulo={`Elegir ${numero}`}
          onPress={alElegir}
          deshabilitado={deshabilitado}
          iconoDerecha={() => <Text style={estilos.flecha}>→</Text>}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  foto: { width: '100%', height: 150, backgroundColor: COLOR.campo },
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.s },
  // Título a la izquierda y las etiquetas a la derecha, como en el mockup "3. Elegir alojamiento".
  filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: ESPACIO.s },
  insignias: { flexDirection: 'column', alignItems: 'flex-end', gap: ESPACIO.xs },
  titulo: { flex: 1, ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.texto },
  detalle: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  nota: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.texto },
  servicios: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.xs },
  servicio: { backgroundColor: COLOR.campo, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.m, paddingVertical: 4, maxWidth: '70%' },
  servicioTexto: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
  precio: { ...FUENTE.fuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  porNoche: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  total: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  flecha: { color: '#fff', fontSize: TAMANO.subtitulo },
});
