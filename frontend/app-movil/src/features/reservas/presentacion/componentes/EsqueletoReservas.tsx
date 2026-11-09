// ======================================================================
// ARCHIVO: reservas/presentacion/componentes/EsqueletoReservas.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La "sombra" de Mis reservas mientras cargan: la fila de filtros y tres tarjetas de reserva.
// PARA QUÉ SIRVE: Que se vea la forma de la lista y no un círculo girando en una pantalla vacía.
// SIN ÉL: Mis reservas mostraría un círculo de carga y la lista "saltaría" al llegar.
// NO VA AQUÍ: Datos: es solo dibujo.
// ======================================================================

import { ScrollView, View } from 'react-native';
import { Esqueleto } from '../../../../shared/ui/Esqueleto';
import { RADIO } from '../../../../shared/ui/tema';
import { estilos } from './EsqueletoReservas.styles';

export function EsqueletoReservas() {
  return (
    <ScrollView
      contentContainerStyle={estilos.pagina}
      scrollEnabled={false}
      accessible
      accessibilityLabel="Cargando tus reservas"
    >
      <View style={estilos.filtros}>
        {[88, 96, 110].map((ancho) => (
          <Esqueleto key={ancho} ancho={ancho} alto={36} radio={RADIO.pildora} />
        ))}
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={estilos.tarjeta}>
          <Esqueleto ancho="70%" alto={18} />
          <Esqueleto ancho="45%" alto={14} />
          <Esqueleto ancho="60%" alto={14} />
          <View style={estilos.pie}>
            <Esqueleto ancho={110} alto={24} radio={RADIO.pildora} />
            <Esqueleto ancho={80} alto={18} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
