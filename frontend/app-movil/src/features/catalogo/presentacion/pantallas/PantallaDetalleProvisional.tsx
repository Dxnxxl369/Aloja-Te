// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaDetalleProvisional.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La ficha mínima de un alojamiento: foto, nombre, lugar, nota, descripción y la barra de reservar.
// PARA QUÉ SIRVE: Que "Ver ficha" del explorador lleve a algún sitio mientras se hace el detalle completo (Fase 3).
// SIN ÉL: "Ver ficha" no abriría nada.
// NO VA AQUÍ: Cargar más datos ni la reserva: avisa con `alReservar`. SE REEMPLAZA en la Fase 3.
// ======================================================================
// Solo muestra lo que ya trae la tarjeta; no pide nada al servidor.

import { Building2, MapPin } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraReserva } from '../../../../shared/ui/BarraReserva';
import { Calificacion } from '../../../../shared/ui/Calificacion';
import { formatearPrecio } from '../../../../shared/ui/TarjetaAlojamiento';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import { COLOR, ESPACIO, FUENTE } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';

interface Props {
  datos: DatosTarjetaAlojamiento;
  alReservar: () => void;
  alAsistente: () => void;
}

export function PantallaDetalleProvisional({ datos, alReservar, alAsistente }: Props) {
  const lugar = [datos.ciudad, datos.departamento]
    .filter((p): p is string => !!p && p.trim().length > 0)
    .filter((p, i, todos) => todos.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i)
    .join(', ');

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.pagina}>
        {datos.fotoUrl ? (
          <Image source={{ uri: datos.fotoUrl }} style={estilos.foto} resizeMode="cover" accessibilityLabel={`Foto de ${datos.titulo}`} />
        ) : (
          <View style={[estilos.foto, estilos.sinFoto]}>
            <Building2 color={COLOR.primario} size={48} strokeWidth={1.5} />
          </View>
        )}
        <View style={estilos.cuerpo}>
          <View style={estilos.fila}>
            {datos.tipo ? <Text style={estilos.tipo}>{datos.tipo.toUpperCase()}</Text> : null}
            <Calificacion nota={datos.calificacion} totalResenas={datos.totalResenas} />
          </View>
          <Text style={estilos.titulo}>{datos.titulo}</Text>
          {datos.verificado ? <Verificado /> : null}
          {lugar ? (
            <View style={estilos.fila}>
              <MapPin color={COLOR.primario} size={16} />
              <Text style={estilos.suave}>{lugar}</Text>
            </View>
          ) : null}
          {datos.descripcion ? <Text style={estilos.descripcion}>{datos.descripcion}</Text> : null}
        </View>
      </ScrollView>

      <BarraReserva
        titulo="Reservar"
        alPresionar={alReservar}
        alAsistente={alAsistente}
        precio={typeof datos.precioNoche === 'number' ? formatearPrecio(datos.precioNoche) : undefined}
        unidadPrecio="/ noche"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { paddingBottom: ESPACIO.xl },
  foto: { width: '100%', height: 260, backgroundColor: COLOR.campo },
  sinFoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR.primarioSuave },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.m },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, flexWrap: 'wrap' },
  tipo: { fontFamily: FUENTE.semi, fontSize: 11, letterSpacing: 0.6, color: COLOR.primario },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 28, lineHeight: 36, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave, flexShrink: 1 },
  descripcion: { fontFamily: FUENTE.normal, fontSize: 15, lineHeight: 23, color: COLOR.texto },
});
