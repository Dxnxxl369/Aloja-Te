// ======================================================================
// ARCHIVO: app/routes/RutaAgente.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La conexión de la pestaña "Agente": le da a la pantalla el agente, abre el pago al terminar y muestra el icono de la IA del celular.
// PARA QUÉ SIRVE: Que el chat del agente no sepa de navegación y conserve su conversación al cambiar de pestaña.
// SIN ÉL: El agente no podría llevar al pago ni cargar la IA local.
// NO VA AQUÍ: La conversación ni las reglas del plan (son del feature agente).
// ======================================================================

import { useCallback } from 'react';
import { useEstadoModelo } from '../../core';
import { IndicadorModoIa, PantallaAgente } from '../../features/agente';
import { useIaLocal } from '../../features/ia';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsTab } from '../routeTypes';

export function RutaAgente({ navigation, route }: PropsTab<'Agente'>) {
  const { agente, reservas } = useFeatures();
  useIaLocal();
  const resolverReservaEnCola = useCallback(
    async (clave: string) => (await reservas.casos.obtenerReservaPorClave(clave))?.id ?? null,
    [reservas],
  );
  const estadoModelo = useEstadoModelo();
  return (
    <Marco
      titulo="Agente de reservas"
      alVolver={volverSeguro(navigation)}
      derecha={
        <IndicadorModoIa modo={estadoModelo === 'CARGADO' ? 'local' : 'basico'} alPresionar={() => navigation.navigate('ModeloIa')} />
      }
    >
      <PantallaAgente
        casos={agente.casos}
        alPagar={(reservaId) => navigation.navigate('Reserva', { reservaId })}
        resolverReservaEnCola={resolverReservaEnCola}
        contexto={route.params?.alojamiento}
        claveContexto={route.params?.inicio}
      />
    </Marco>
  );
}
