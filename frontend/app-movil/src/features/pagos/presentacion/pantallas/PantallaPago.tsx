// ======================================================================
// ARCHIVO: pagos/presentacion/pantallas/PantallaPago.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de pago: ordena el resumen, el método de pago (QR / Transferencia) y el resultado.
// PARA QUÉ SIRVE: Es el pago "sin agente": un flujo directo, transparente y predecible.
// ======================================================================

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
  const { pago, anfitrion, error, cargando, confirmando, segundosQr, reintentar, confirmarPago } = usePago(
    casos,
    solicitud
  );
  const [qrGrande, setQrGrande] = useState(false);
  const [zoomData, setZoomData] = useState<string | null>(null);

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
  const defaultQrData = anfitrion?.qrUrl || pago.qr?.cadena || null;

  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      <PaymentSummary pago={pago} money={(n) => formatearDinero(n, pago.moneda)} />

      {pago.estado === 'PENDIENTE' && (
        <QrPaymentCard
          pago={pago}
          anfitrion={anfitrion}
          secondsLeft={segundosQr}
          shortId={shortId}
          onZoom={(data) => {
            setZoomData(data);
            setQrGrande(true);
          }}
          onBack={() => alTerminar(false)}
          onConfirmar={confirmarPago}
          confirmando={confirmando}
        />
      )}

      <PaymentResultCard pago={pago} shortId={shortId} onFinish={alTerminar} />

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <View style={estilos.seguro}>
        <Lock color={COLOR.primario} size={16} />
        <Text style={estilos.seguroTexto}>{PAYMENT_TEXT.SECURE}</Text>
      </View>

      <QrZoomModal
        visible={qrGrande}
        qrData={zoomData || defaultQrData}
        onClose={() => setQrGrande(false)}
      />
    </ScrollView>
  );
}
