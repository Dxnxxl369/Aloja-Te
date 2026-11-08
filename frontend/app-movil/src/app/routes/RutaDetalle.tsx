// ======================================================================
// ARCHIVO: app/routes/RutaDetalle.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de la ficha del alojamiento: le da a la pantalla el catálogo, abre "Reservar" o el agente y comparte el alojamiento.
// PARA QUÉ SIRVE: Que la ficha no sepa de navegación ni del menú de compartir.
// SIN ÉL: La ficha no podría llevar a reservar ni compartir.
// NO VA AQUÍ: Dibujo (es PantallaDetalle) ni el texto de compartir (es buildShareMessage, del feature catalogo).
// ======================================================================

import { Share } from 'react-native';
import { buildShareMessage, PantallaDetalle } from '../../features/catalogo';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { paramsAsistente, volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';

export function RutaDetalle({ navigation, route }: PropsRaiz<'Detalle'>) {
  const { catalogo } = useFeatures();
  const { datos } = route.params;
  const irAlAsistente = () => navigation.navigate('Tabs', { screen: 'Agente', params: paramsAsistente(datos) });
  const compartir = () => void Share.share({ message: buildShareMessage(datos) }).catch(() => undefined);
  return (
    <Marco titulo="Detalle del alojamiento" alVolver={volverSeguro(navigation)} alCompartir={compartir}>
      <PantallaDetalle
        casos={catalogo.casos}
        datos={datos}
        alReservarManual={() => navigation.navigate('ReservaManual', { alojamientoId: datos.id, titulo: datos.titulo })}
        alAsistente={irAlAsistente}
      />
    </Marco>
  );
}
