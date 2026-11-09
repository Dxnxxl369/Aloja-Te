// ======================================================================
// ARCHIVO: app/routes/RutaReserva.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La conexión del detalle de una reserva: le da a la pantalla las reservas y la foto del alojamiento, y abre el pago armando la solicitud.
// PARA QUÉ SIRVE: Es el puente entre reservas y pagos sin que esos dos features se conozcan: aquí se arma la solicitud de pago a partir de la reserva.
// SIN ÉL: La reserva no podría llevar al pago.
// NO VA AQUÍ: Dibujo (es PantallaReserva) ni cómo se paga (es el feature pagos).
// ======================================================================

import { PantallaReserva } from '../../features/reservas';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';

export function RutaReserva({ navigation, route }: PropsRaiz<'Reserva'>) {
  const { reservas, fichaAlojamiento } = useFeatures();
  return (
    <Marco titulo="Detalle de reserva" alVolver={volverSeguro(navigation)}>
      <PantallaReserva
        casos={reservas.casos}
        cargarFicha={fichaAlojamiento}
        reservaId={route.params.reservaId}
        pagoRecibido={route.params.pagoRecibido}
        alPagar={(r) =>
          navigation.navigate('Pago', {
            solicitud: {
              reservaId: r.id,
              anfitrionId: r.anfitrionId,
              subtotal: r.total,
              reservaBloqueadaHasta: r.bloqueadaHasta,
            },
          })
        }
      />
    </Marco>
  );
}
