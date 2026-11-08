// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/EsqueletoFicha.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Las "sombras" de los bloques de la ficha que aún no llegaron: los datos rápidos y la lista de servicios.
// PARA QUÉ SIRVE: Que el lugar donde van a aparecer esté reservado y la ficha no salte al llegar el detalle.
// SIN ÉL: La ficha mostraría un círculo pequeño y los bloques aparecerían de golpe empujando el resto.
// NO VA AQUÍ: Datos: es solo dibujo. Cada pieza se pone donde irá el bloque real.
// ======================================================================

import { View } from 'react-native';
import { Esqueleto } from '../../../../../shared/ui/Esqueleto';
import { RADIO } from '../../../../../shared/ui/tema';
import { estilos } from './EsqueletoFicha.styles';

/** Donde irán capacidad, check-in y check-out (FichaDatosRapidos). */
export function EsqueletoDatosRapidos() {
  return (
    <View style={estilos.fila} accessible accessibilityLabel="Cargando datos del alojamiento">
      {[0, 1, 2].map((i) => (
        <Esqueleto key={i} ancho="31.5%" alto={86} radio={RADIO.tarjeta} />
      ))}
    </View>
  );
}

/** Donde irán los servicios (dentro de FichaSobreYServicios). */
export function EsqueletoServicios() {
  return (
    <View style={estilos.caja} accessible accessibilityLabel="Cargando servicios">
      <Esqueleto ancho={190} alto={18} />
      <View style={estilos.grilla}>
        {[0, 1, 2, 3].map((i) => (
          <Esqueleto key={i} ancho="48.5%" alto={56} radio={RADIO.tarjeta} />
        ))}
      </View>
    </View>
  );
}
