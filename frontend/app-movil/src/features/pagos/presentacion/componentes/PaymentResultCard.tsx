// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/PaymentResultCard.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La tarjeta del resultado del pago: verde "¡Pago aprobado!" con sus comprobantes, o roja si falló o se reembolsó.
// PARA QUÉ SIRVE: Cerrar el flujo: lleva de vuelta a la reserva (aprobado) o permite volver (fallido).
// SIN ÉL: El usuario no sabría cómo terminó el pago.
// NO VA AQUÍ: Saber el estado del pago (eso es usePago): lo recibe en `pago.estado`.
// ======================================================================
// Mientras el pago está PENDIENTE no dibuja nada (en ese caso se ve la tarjeta del QR).

import { CheckCircle2, XCircle } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR } from '../../../../shared/ui/tema';
import type { Pago } from '../../domain/modelos';
import { PAYMENT_TEXT } from '../texts';
import { estilos } from './PaymentResultCard.styles';

interface Props {
  pago: Pago;
  /** Código corto de la transacción ("9F3A2B1C"). */
  shortId: string;
  /** `completed` es true si el pago salió bien: la pantalla vuelve a la reserva avisándolo. */
  onFinish: (completed: boolean) => void;
}

export function PaymentResultCard({ pago, shortId, onFinish }: Props) {
  if (pago.estado === 'COMPLETADO') {
    return (
      <View style={[estilos.tarjeta, estilos.exito]}>
        <CheckCircle2 color={COLOR.exito} size={40} />
        <Text style={estilos.exitoTitulo}>{PAYMENT_TEXT.APPROVED}</Text>
        <Text style={estilos.suave}>
          {PAYMENT_TEXT.TRANSACTION} {shortId}
        </Text>
        {pago.comprobantes.map((c) => (
          <Text key={c.id} style={estilos.suave}>
            {c.tipo} {c.numero}
          </Text>
        ))}
        <View style={estilos.ancho}>
          <Boton titulo={PAYMENT_TEXT.SEE_RESERVATION} onPress={() => onFinish(true)} />
        </View>
      </View>
    );
  }

  if (pago.estado === 'FALLIDO' || pago.estado === 'REEMBOLSADO') {
    return (
      <View style={[estilos.tarjeta, estilos.fallo]}>
        <XCircle color={COLOR.error} size={40} />
        <Text style={estilos.error}>{pago.estado === 'FALLIDO' ? PAYMENT_TEXT.FAILED : PAYMENT_TEXT.REFUNDED}</Text>
        <Text style={estilos.suave}>
          {PAYMENT_TEXT.TRANSACTION} {shortId}
        </Text>
        <View style={estilos.ancho}>
          <Boton variante="contorno" titulo={PAYMENT_TEXT.BACK} onPress={() => onFinish(false)} />
        </View>
      </View>
    );
  }

  return null;
}
