// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaSobreYServicios.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El bloque "Sobre este alojamiento": la descripción y, debajo, "Lo que ofrece este lugar" con los servicios.
// PARA QUÉ SIRVE: Responder "¿qué ofrece?" en un solo lugar.
// SIN ÉL: La descripción y los servicios serían dos tarjetas separadas.
// NO VA AQUÍ: Cargar datos: recibe la descripción y los nombres de los servicios.
// ======================================================================
// Datos: descripcion ← alojamientos.descripcion; servicios ← tabla alojamiento_servicio. Cada parte se dibuja solo si existe.

import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../../shared/ui/tema';
import { ServiciosGrid } from '../ServiciosGrid';
import { BloqueFicha } from './BloqueFicha';

interface Props {
  descripcion?: string;
  servicios: string[];
}

export function FichaSobreYServicios({ descripcion, servicios }: Props) {
  if (!descripcion && servicios.length === 0) return null;
  return (
    <BloqueFicha titulo="Sobre este alojamiento">
      {descripcion ? <Text style={estilos.descripcion}>{descripcion}</Text> : null}
      {servicios.length > 0 ? (
        <View style={{ gap: ESPACIO.m }}>
          <View style={estilos.filaServicios}>
            <Text style={estilos.subtitulo}>Lo que ofrece este lugar</Text>
            <Text style={estilos.cuenta}>
              {servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'}
            </Text>
          </View>
          <ServiciosGrid servicios={servicios} />
        </View>
      ) : null}
    </BloqueFicha>
  );
}

const estilos = StyleSheet.create({
  descripcion: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 22, color: COLOR.texto },
  filaServicios: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  subtitulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto, flexShrink: 1 },
  cuenta: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
