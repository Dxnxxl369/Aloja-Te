// ======================================================================
// ARCHIVO: anfitrion/presentacion/componentes/TarjetaPropiedad.tsx
// QUÉ ES: Tarjeta visual de propiedad para la lista del anfitrión (con soporte táctil para edición).
// ======================================================================

import { AlertTriangle, BedDouble, CheckCircle2, ChevronRight, Clock, MapPin, XCircle } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { PropiedadAnfitrion } from '../../domain/modelos';

interface Props {
  propiedad: PropiedadAnfitrion;
  onPress?: () => void;
}

export function TarjetaPropiedad({ propiedad, onPress }: Props) {
  const { estadoPublicacion, motivoObservacion } = propiedad;

  const configEstado = () => {
    switch (estadoPublicacion) {
      case 'PUBLICADO':
        return {
          texto: 'Publicado',
          color: COLOR.exitoOscuro,
          fondo: COLOR.exitoFondo,
          borde: COLOR.exitoBorde,
          Icono: CheckCircle2,
        };
      case 'OBSERVADO':
        return {
          texto: 'Observado',
          color: COLOR.avisoOscuro,
          fondo: COLOR.avisoFondo,
          borde: COLOR.avisoBorde,
          Icono: AlertTriangle,
        };
      case 'EN_REVISION':
        return {
          texto: 'En Revisión',
          color: COLOR.primario,
          fondo: COLOR.primarioSuave,
          borde: COLOR.primarioBorde,
          Icono: Clock,
        };
      case 'RECHAZADO':
        return {
          texto: 'Rechazado',
          color: COLOR.errorOscuro,
          fondo: COLOR.errorFondo,
          borde: COLOR.errorBorde,
          Icono: XCircle,
        };
      default:
        return {
          texto: 'Borrador',
          color: COLOR.textoSuave,
          fondo: COLOR.campo,
          borde: COLOR.borde,
          Icono: Clock,
        };
    }
  };

  const est = configEstado();
  const IconoEstado = est.Icono;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.tarjetaPresionada]}
      accessibilityRole="button"
      accessibilityLabel={`Propiedad ${propiedad.titulo}, estado ${est.texto}`}
    >
      {propiedad.fotoPrincipal ? (
        <Image source={{ uri: propiedad.fotoPrincipal }} style={estilos.foto} resizeMode="cover" />
      ) : (
        <View style={[estilos.foto, estilos.fotoVacia]}>
          <BedDouble color={COLOR.textoSuave} size={32} />
        </View>
      )}

      <View style={estilos.cuerpo}>
        <View style={estilos.cabecera}>
          <View style={[estilos.insigniaEstado, { backgroundColor: est.fondo, borderColor: est.borde }]}>
            <IconoEstado color={est.color} size={13} />
            <Text style={[estilos.insigniaTexto, { color: est.color }]}>{est.texto}</Text>
          </View>
          <Text style={estilos.tipo}>{propiedad.tipoPropiedadNombre}</Text>
        </View>

        <Text style={estilos.titulo} numberOfLines={2}>
          {propiedad.titulo}
        </Text>

        <View style={estilos.filaUbicacion}>
          <MapPin color={COLOR.textoSuave} size={14} />
          <Text style={estilos.ubicacion}>
            {propiedad.ciudad}, {propiedad.departamento}
          </Text>
        </View>

        {/* Mensaje de observación de moderación */}
        {estadoPublicacion === 'OBSERVADO' && motivoObservacion ? (
          <View style={estilos.cajaObservacion}>
            <AlertTriangle color={COLOR.avisoOscuro} size={14} />
            <Text style={estilos.textoObservacion} numberOfLines={3}>
              {motivoObservacion}
            </Text>
          </View>
        ) : null}

        <View style={estilos.pie}>
          <Text style={estilos.precio}>
            Bs. {propiedad.precioNoche} <Text style={estilos.noche}>/ noche</Text>
          </Text>
          <View style={estilos.filaDerecha}>
            <View style={estilos.habitacionesPildora}>
              <BedDouble color={COLOR.primario} size={13} />
              <Text style={estilos.habitacionesTexto}>
                {propiedad.unidadesCount} {propiedad.unidadesCount === 1 ? 'unidad' : 'unidades'}
              </Text>
            </View>
            {onPress && <ChevronRight color={COLOR.textoSuave} size={18} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    overflow: 'hidden',
    marginBottom: ESPACIO.m,
  },
  tarjetaPresionada: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  foto: {
    width: '100%',
    height: 150,
  },
  fotoVacia: {
    backgroundColor: COLOR.campo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    padding: ESPACIO.m,
    gap: ESPACIO.xs,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  insigniaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
  },
  insigniaTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
  },
  tipo: {
    ...FUENTE.medio,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    textTransform: 'uppercase',
  },
  titulo: {
    ...FUENTE.tituloFuerte,
    fontSize: 16,
    color: COLOR.texto,
    lineHeight: 22,
  },
  filaUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ubicacion: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  cajaObservacion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLOR.avisoFondo,
    borderColor: COLOR.avisoBorde,
    borderWidth: 1,
    borderRadius: RADIO.control,
    padding: ESPACIO.s,
    marginTop: 4,
  },
  textoObservacion: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.avisoOscuro,
    flex: 1,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ESPACIO.xs,
    paddingTop: ESPACIO.s,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
  },
  precio: {
    ...FUENTE.tituloFuerte,
    fontSize: 16,
    color: COLOR.texto,
  },
  noche: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  filaDerecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitacionesPildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLOR.primarioSuave,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
  },
  habitacionesTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: COLOR.primario,
  },
});
