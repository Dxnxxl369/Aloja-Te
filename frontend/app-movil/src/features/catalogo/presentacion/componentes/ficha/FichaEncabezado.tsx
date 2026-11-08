// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaEncabezado.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El bloque de arriba de la ficha, bajo las fotos: tipo de propiedad, nombre y calificación.
// PARA QUÉ SIRVE: Responder "¿qué alojamiento es?" de un vistazo.
// SIN ÉL: El nombre del alojamiento no aparecería en la ficha.
// NO VA AQUÍ: Cargar datos: recibe lo que ya se sabe (tipo, título, nota).
// ======================================================================
// Datos: tipo ← tipos_propiedad; título ← alojamientos.titulo; nota y reseñas ← tabla valoraciones.

import { StyleSheet, Text, View } from 'react-native';
import { Calificacion } from '../../../../../shared/ui/Calificacion';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../../shared/ui/tema';

interface Props {
  tipo?: string;
  titulo: string;
  calificacion?: number | null;
  totalResenas?: number;
}

export function FichaEncabezado({ tipo, titulo, calificacion, totalResenas }: Props) {
  return (
    <View style={{ gap: ESPACIO.m }}>
      <View style={estilos.filaTipo}>
        {tipo ? <Text style={estilos.tipo}>{tipo.toUpperCase()}</Text> : <View />}
        <Calificacion nota={calificacion} totalResenas={totalResenas} variante="pildora" />
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  filaTipo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  tipo: { ...FUENTE.semi, fontSize: TAMANO.micro, letterSpacing: 0.6, color: COLOR.primario, flexShrink: 1 },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, lineHeight: 30, color: COLOR.texto },
});
