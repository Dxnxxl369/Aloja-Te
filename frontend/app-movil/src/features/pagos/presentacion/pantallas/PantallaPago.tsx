// ======================================================================
// ARCHIVO: pagos/presentacion/pantallas/PantallaPago.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de pago: ordena el resumen, el QR (QR Simple BNB) y el resultado.
// PARA QUÉ SIRVE: Es el pago "sin agente": un flujo directo y predecible.
// SIN ÉL: El usuario no tendría cómo pagar la reserva.
// NO VA AQUÍ: Reglas ni llamadas HTTP (usePago), ni el dibujo de cada tarjeta (componentes/), ni los textos (texts.ts).
// ======================================================================
// Diseño: mockup "5. Pago con QR Simple". El QR se dibuja con react-native-qrcode-svg.
// Solo se muestran datos reales del pago (descuento y cargo de servicio vienen de MS-03).
// Esta pantalla solo decide qué tarjeta mostrar según el estado del pago.

import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { formatearDinero } from '../../../../shared/ui/dinero';
import { COLOR } from '../../../../shared/ui/tema';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import type { CasosPagos } from '../../domain/interfaces';
import type { SolicitudPago } from '../../domain/modelos';
import { PaymentResultCard } from '../componentes/PaymentResultCard';
import { PaymentSummary } from '../componentes/PaymentSummary';
import { QrPaymentCard } from '../componentes/QrPaymentCard';
import { QrZoomModal } from '../componentes/QrZoomModal';
import { shortPaymentId } from '../paymentFormat';
import { PAYMENT_TEXT } from '../texts';
import { usePago } from '../usePago';
import { estilos } from './PantallaPago.styles';

interface Props {
  casos: CasosPagos;
  solicitud: SolicitudPago;
  /** `completado` es true si el pago salió bien: la ruta vuelve a la reserva avisándolo. */
  alTerminar: (completado: boolean) => void;
}

export function PantallaPago({ casos, solicitud, alTerminar }: Props) {
  const { pago, error, cargando, segundosQr, reintentar, simular } = usePago(casos, solicitud);
  const [qrGrande, setQrGrande] = useState(false);

  if (cargando && !pago) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={COLOR.primario} size="large" />
        <Text style={estilos.suave}>{PAYMENT_TEXT.PREPARING}</Text>
      </View>
    );
  }
  if (!pago) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error ?? PAYMENT_TEXT.START_FAILED}</Text>
        <Boton titulo={COMMON_TEXT.RETRY} onPress={() => void reintentar()} />
      </View>
    );
  }

  const shortId = shortPaymentId(pago.id);

  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      <PaymentSummary pago={pago} money={(n) => formatearDinero(n, pago.moneda)} />

      {pago.estado === 'PENDIENTE' && (
        <QrPaymentCard
          pago={pago}
          secondsLeft={segundosQr}
          shortId={shortId}
          onZoom={() => setQrGrande(true)}
          onBack={() => alTerminar(false)}
          simulate={simular}
        />
      )}

      <PaymentResultCard pago={pago} shortId={shortId} onFinish={alTerminar} />

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <View style={estilos.seguro}>
        <Lock color={COLOR.primario} size={16} />
        <Text style={estilos.seguroTexto}>{PAYMENT_TEXT.SECURE}</Text>
      </View>

      <QrZoomModal visible={qrGrande} qrData={pago.qr?.cadena ?? null} onClose={() => setQrGrande(false)} />
    </ScrollView>
  );
}
