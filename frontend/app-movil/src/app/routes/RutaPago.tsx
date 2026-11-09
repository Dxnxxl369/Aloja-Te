// ======================================================================
// ARCHIVO: app/routes/RutaPago.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de la pantalla de pago: le da el feature de pagos y, al terminar, vuelve a la reserva.
// PARA QUÉ SIRVE: Que el pago no sepa de navegación. Si se pagó, vuelve a la reserva existente avisando que el pago llegó, sin apilar otra.
// SIN ÉL: Al terminar de pagar no se sabría a dónde volver.
// NO VA AQUÍ: Dibujo (es PantallaPago) ni cómo se paga (es el feature pagos).
// ======================================================================

import { PantallaPago } from '../../features/pagos';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';

export function RutaPago({ navigation, route }: PropsRaiz<'Pago'>) {
  const { pagos } = useFeatures();
  return (
    <Marco titulo="Pago con QR" alVolver={volverSeguro(navigation)}>
      <PantallaPago
        casos={pagos.casos}
        solicitud={route.params.solicitud}
        alTerminar={(completado) =>
          completado
            ? // Vuelve a la reserva (sin apilar otra) avisando que el pago ya llegó.
              navigation.popTo('Reserva', { reservaId: route.params.solicitud.reservaId, pagoRecibido: true })
            : volverSeguro(navigation)()
        }
      />
    </Marco>
  );
}
