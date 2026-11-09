// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/EsqueletoExplorar.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La "sombra" de la pantalla de inicio mientras cargan los alojamientos: dos tarjetas de destacados y dos filas de la lista.
// PARA QUÉ SIRVE: Que se vea la forma de lo que va a aparecer y no un círculo girando en una pantalla vacía.
// SIN ÉL: Explorar mostraría un círculo de carga y el contenido "saltaría" al llegar.
// NO VA AQUÍ: Datos: es solo dibujo. Tiene las mismas medidas que TarjetaAlojamiento para que no haya saltos.
// ======================================================================

import { View } from 'react-native';
import { FEATURED_PHOTO_HEIGHT, LIST_PHOTO_SIZE } from '../../../../shared/ui/cardSizes';
import { Esqueleto } from '../../../../shared/ui/Esqueleto';
import { ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './EsqueletoExplorar.styles';

export function EsqueletoExplorar({ anchoTarjeta }: { anchoTarjeta: number }) {
  return (
    <View style={{ gap: ESPACIO.xl }} accessible accessibilityLabel="Cargando alojamientos">
      <View style={{ gap: ESPACIO.m }}>
        <Esqueleto ancho={150} alto={22} />
        <View style={estilos.fila}>
          {[0, 1].map((i) => (
            <View key={i} style={[estilos.tarjeta, { width: anchoTarjeta }]}>
              <Esqueleto alto={FEATURED_PHOTO_HEIGHT} radio={0} />
              <View style={estilos.cuerpo}>
                <Esqueleto ancho="90%" alto={16} />
                <Esqueleto ancho="55%" alto={14} />
                <Esqueleto ancho="40%" alto={16} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: ESPACIO.m }}>
        <Esqueleto ancho={200} alto={22} />
        {[0, 1].map((i) => (
          <View key={i} style={estilos.filaLista}>
            <Esqueleto ancho={LIST_PHOTO_SIZE} alto={LIST_PHOTO_SIZE} />
            <View style={{ flex: 1, gap: ESPACIO.s }}>
              <Esqueleto ancho="80%" alto={16} />
              <Esqueleto ancho="50%" alto={14} />
              <Esqueleto ancho="35%" alto={16} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
