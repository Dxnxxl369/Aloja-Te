// ======================================================================
// ARCHIVO: app/routes/RutaMisReservas.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de "Mis reservas": le da a la pantalla las reservas del usuario y abre el detalle de la que se toque.
// PARA QUÉ SIRVE: Que la lista no sepa de sesión ni de navegación.
// SIN ÉL: Las reservas no se podrían abrir desde el perfil.
// NO VA AQUÍ: Dibujo (es PantallaMisReservas) ni reglas de reservas.
// ======================================================================

import { useSesion } from '../../core';
import { PantallaMisReservas } from '../../features/reservas';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';

export function RutaMisReservas({ navigation }: PropsRaiz<'MisReservas'>) {
  const { reservas } = useFeatures();
  const { sesion } = useSesion();
  return (
    <Marco titulo="Mis reservas" alVolver={volverSeguro(navigation)}>
      {sesion ? (
        <PantallaMisReservas
          casos={reservas.casos}
          clienteId={sesion.usuarioId}
          alAbrir={(reservaId) => navigation.navigate('Reserva', { reservaId })}
          alExplorar={() => navigation.navigate('Tabs', { screen: 'Explorar' })}
        />
      ) : null}
    </Marco>
  );
}
