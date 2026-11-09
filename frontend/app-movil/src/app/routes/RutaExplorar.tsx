// ======================================================================
// ARCHIVO: app/routes/RutaExplorar.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de la pestaña "Explorar": le da a la pantalla el catálogo y abre la ficha al tocar un alojamiento.
// PARA QUÉ SIRVE: Que la pantalla no sepa de navegación.
// SIN ÉL: Explorar no podría abrir la ficha.
// NO VA AQUÍ: Dibujo ni reglas del catálogo (son del feature catalogo).
// ======================================================================

import { PantallaExplorar } from '../../features/catalogo';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import type { PropsTab } from '../routeTypes';

export function RutaExplorar({ navigation }: PropsTab<'Explorar'>) {
  const { catalogo } = useFeatures();
  return (
    <Marco marca>
      {/* Reservar se hace desde la ficha del alojamiento; el agente está en la barra de abajo. */}
      <PantallaExplorar casos={catalogo.casos} alVer={(datos) => navigation.navigate('Detalle', { datos })} />
    </Marco>
  );
}
