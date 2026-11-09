// ======================================================================
// ARCHIVO: anfitrion/presentacion/componentes/TarjetaPropiedad.tsx
// QUÉ ES: Tarjeta visual de propiedad para la lista del anfitrión.
// ======================================================================

import { AlertTriangle, BedDouble, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { PropiedadAnfitrion } from '../../domain/modelos';

interface Props {
  propiedad: PropiedadAnfitrion;
}

export function TarjetaPropiedad({ propiedad }: Props) {
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
    <View style={estilos.tarjeta}>
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
          <View style={estilos.habitacionesPildora}>
            <BedDouble color={COLOR.primario} size={13} />
            <Text style={estilos.habitacionesTexto}>
              {propiedad.unidadesCount} {propiedad.unidadesCount === 1 ? 'unidad' : 'unidades'}
            </Text>
          </View>
        </View>
      </View>
    </View>
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
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
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
    borderRadius: RADIO.control,
    padding: ESPACIO.s,
    borderWidth: 1,
    borderColor: COLOR.avisoBorde,
    marginTop: 4,
  },
  textoObservacion: {
    flex: 1,
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.avisoOscuro,
    lineHeight: 16,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ESPACIO.s,
    paddingTop: ESPACIO.s,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
  },
  precio: {
    ...FUENTE.fuerte,
    fontSize: 16,
    color: COLOR.texto,
  },
  noche: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
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
    ...FUENTE.medio,
    fontSize: TAMANO.micro,
    color: COLOR.primario,
  },
});
