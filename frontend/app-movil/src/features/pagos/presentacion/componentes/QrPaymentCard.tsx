// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/QrPaymentCard.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La tarjeta "Paga con QR Simple": el QR, el banco, la glosa para copiar, la hora límite y el aviso de que se espera al banco.
// PARA QUÉ SIRVE: Es lo que el usuario escanea para pagar. Si el QR vence o ya no está disponible, lo dice y ofrece volver a la reserva.
// SIN ÉL: El usuario no tendría cómo pagar.
// NO VA AQUÍ: Pedir el pago ni saber si el banco confirmó (eso es usePago): recibe todo ya resuelto.
// ======================================================================
// "¡Copiado!" se apaga solo (COPIED_FEEDBACK_MS). El botón de simular el pago solo aparece en modo demo (`simulate` distinto de null).

import * as Clipboard from 'expo-clipboard';
import { Check, Clock, Copy, Maximize2, QrCode, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR } from '../../../../shared/ui/tema';
import { formatearSegundos } from '../../../../shared/ui/tiempo';
import { COPIED_FEEDBACK_MS, QR_SIZE } from '../../constantes';
import type { Pago, QrPago } from '../../domain/modelos';
import { deadlineTime } from '../paymentFormat';
import { PAYMENT_TEXT } from '../texts';
import { estilos } from './QrPaymentCard.styles';

interface Props {
  pago: Pago;
  /** Segundos que le quedan al QR; null si no hay plazo conocido. */
  secondsLeft: number | null;
  /** Código corto de la transacción ("9F3A2B1C"). */
  shortId: string;
  onZoom: () => void;
  onBack: () => void;
  /** Simula el aviso del banco (solo demo); null si no está habilitado. */
  simulate: (() => void | Promise<void>) | null;
}

export function QrPaymentCard({ pago, secondsLeft, shortId, onZoom, onBack, simulate }: Props) {
  const [copied, setCopied] = useState(false);

  // El "¡Copiado!" se apaga solo.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [copied]);

  const qr = pago.qr;
  const expired = secondsLeft === 0;
  const limit = deadlineTime(secondsLeft, Date.now());

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.iconoQr}>
        <QrCode color={COLOR.primario} size={26} />
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {PAYMENT_TEXT.QR_TITLE}
      </Text>

      {qr ? (
        <>
          <Text style={estilos.suave}>
            {qr.banco} · {qr.alias}
          </Text>
          {expired ? <ExpiredNotice onBack={onBack} /> : <QrImage qr={qr} onZoom={onZoom} />}
          <GlossButton gloss={qr.glosa} copied={copied} onCopied={() => setCopied(true)} />
          <Text style={estilos.suave}>
            {PAYMENT_TEXT.TRANSACTION} {shortId}
          </Text>
          {limit ? (
            <Text style={estilos.suave}>
              {PAYMENT_TEXT.PAY_BEFORE} {limit}
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={estilos.aviso}>{PAYMENT_TEXT.QR_UNAVAILABLE}</Text>
      )}

      <View style={estilos.espera}>
        <ActivityIndicator color={COLOR.primario} />
        <Text style={estilos.esperaTexto}>{PAYMENT_TEXT.WAITING_BANK}</Text>
      </View>

      {simulate ? (
        <View style={estilos.ancho}>
          <Boton variante="secundario" titulo={PAYMENT_TEXT.SIMULATE_BANK} onPress={() => void simulate()} />
        </View>
      ) : null}

      {secondsLeft !== null ? (
        <View style={estilos.expira}>
          <Clock color={COLOR.textoSuave} size={16} />
          <Text style={estilos.suave}>
            {secondsLeft > 0 ? PAYMENT_TEXT.QR_EXPIRES_IN : PAYMENT_TEXT.QR_EXPIRED_SHORT}
            {secondsLeft > 0 ? <Text style={estilos.expiraTiempo}>{formatearSegundos(secondsLeft)}</Text> : null}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** El QR con sus esquinas de enfoque; tocarlo lo amplía. */
function QrImage({ qr, onZoom }: { qr: QrPago; onZoom: () => void }) {
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={PAYMENT_TEXT.ZOOM_QR_LABEL} onPress={onZoom} style={estilos.marcoQr}>
        <View style={estilos.fondoQr}>
          <QRCode value={qr.cadena} size={QR_SIZE} color={COLOR.texto} backgroundColor={COLOR.blanco} />
        </View>
        {/* Esquinas de enfoque, solo decorativas: no tapan el código. */}
        <View pointerEvents="none" style={[estilos.esquina, estilos.arribaIzquierda]} />
        <View pointerEvents="none" style={[estilos.esquina, estilos.arribaDerecha]} />
        <View pointerEvents="none" style={[estilos.esquina, estilos.abajoIzquierda]} />
        <View pointerEvents="none" style={[estilos.esquina, estilos.abajoDerecha]} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onZoom} style={estilos.ampliar}>
        <Maximize2 color={COLOR.primario} size={16} />
        <Text style={estilos.ampliarTexto}>{PAYMENT_TEXT.ZOOM_QR}</Text>
      </Pressable>
    </>
  );
}

/** Lo que se muestra en lugar del QR cuando venció. */
function ExpiredNotice({ onBack }: { onBack: () => void }) {
  return (
    <View style={estilos.vencido}>
      <XCircle color={COLOR.error} size={32} />
      <Text style={estilos.vencidoTitulo}>{PAYMENT_TEXT.QR_EXPIRED_TITLE}</Text>
      <Text style={estilos.suave}>{PAYMENT_TEXT.QR_EXPIRED_HELP}</Text>
      <View style={estilos.ancho}>
        <Boton variante="contorno" titulo={PAYMENT_TEXT.BACK_TO_RESERVATION} onPress={onBack} />
      </View>
    </View>
  );
}

/** La glosa (la referencia del pago): al tocarla se copia al portapapeles. */
function GlossButton({ gloss, copied, onCopied }: { gloss: string; copied: boolean; onCopied: () => void }) {
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(gloss);
      onCopied();
    } catch {
      /* si el portapapeles falla, la glosa sigue visible para copiarla a mano */
    }
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? PAYMENT_TEXT.GLOSS_COPIED_LABEL : `Copiar glosa ${gloss}`}
      onPress={() => void copy()}
      style={estilos.glosa}
    >
      <Text style={estilos.glosaTexto}>
        {PAYMENT_TEXT.GLOSS} <Text style={estilos.glosaValor}>{gloss}</Text>
      </Text>
      {copied ? <Check color={COLOR.exitoOscuro} size={16} /> : <Copy color={COLOR.textoSuave} size={16} />}
      {copied ? <Text style={estilos.copiado}>{PAYMENT_TEXT.COPIED}</Text> : null}
    </Pressable>
  );
}
