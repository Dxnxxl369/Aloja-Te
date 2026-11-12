// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/QrPaymentCard.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La tarjeta "Paga con QR Simple / Transferencia": el QR del anfitrión o los datos de su cuenta bancaria.
// PARA QUÉ SIRVE: Que el huésped pague directamente al anfitrión y confirme su pago para habilitar su PIN.
// ======================================================================

import * as Clipboard from 'expo-clipboard';
import { Check, Clock, Copy, Landmark, Maximize2, QrCode, ShieldCheck, User, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR } from '../../../../shared/ui/tema';
import { formatearSegundos } from '../../../../shared/ui/tiempo';
import { COPIED_FEEDBACK_MS, QR_SIZE } from '../../constantes';
import type { DatosAnfitrionPago, Pago, QrPago } from '../../domain/modelos';
import { deadlineTime } from '../paymentFormat';
import { PAYMENT_TEXT } from '../texts';
import { estilos } from './QrPaymentCard.styles';

interface Props {
  pago: Pago;
  anfitrion: DatosAnfitrionPago | null;
  /** Segundos que le quedan al QR; null si no hay plazo conocido. */
  secondsLeft: number | null;
  /** Código corto de la transacción ("9F3A2B1C"). */
  shortId: string;
  onZoom: (data: string) => void;
  onBack: () => void;
  /** Confirma el pago de la reserva */
  onConfirmar: (() => void | Promise<void>) | null;
  confirmando: boolean;
}

export function QrPaymentCard({
  pago,
  anfitrion,
  secondsLeft,
  shortId,
  onZoom,
  onBack,
  onConfirmar,
  confirmando,
}: Props) {
  const [tab, setTab] = useState<'QR' | 'TRANSFERENCIA'>('QR');
  const [glosaCopiada, setGlosaCopiada] = useState(false);
  const [cuentaCopiada, setCuentaCopiada] = useState(false);

  // Los avisos de "¡Copiado!" se apagan solos.
  useEffect(() => {
    if (!glosaCopiada) return;
    const t = setTimeout(() => setGlosaCopiada(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [glosaCopiada]);

  useEffect(() => {
    if (!cuentaCopiada) return;
    const t = setTimeout(() => setCuentaCopiada(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [cuentaCopiada]);

  const qr = pago.qr;
  const expired = secondsLeft === 0;
  const limit = deadlineTime(secondsLeft, Date.now());

  // Datos reales del anfitrión
  const nombreAnfitrion = anfitrion?.nombreCompleto || qr?.alias || 'Anfitrión Aloja-Te';
  const bancoAnfitrion = anfitrion?.bancoNombre || qr?.banco || 'Banco Nacional de Bolivia (BNB)';
  const cuentaAnfitrion = anfitrion?.numeroCuentaBancaria || '2000123456789';
  const qrImagen = anfitrion?.qrUrl;
  const qrCadena = qr?.cadena || `BOB;${bancoAnfitrion};${cuentaAnfitrion};${pago.total};${shortId}`;
  const glosaTexto = qr?.glosa || `RES-${shortId}`;

  const copiarCuenta = async () => {
    try {
      await Clipboard.setStringAsync(cuentaAnfitrion);
      setCuentaCopiada(true);
    } catch {}
  };

  return (
    <View style={estilos.tarjeta}>
      {/* Icono de cabecera */}
      <View style={estilos.iconoQr}>
        {tab === 'QR' ? <QrCode color={COLOR.primario} size={26} /> : <Landmark color={COLOR.primario} size={26} />}
      </View>

      <Text style={estilos.titulo} accessibilityRole="header">
        {PAYMENT_TEXT.QR_TITLE}
      </Text>

      {/* Selector de pestañas */}
      <View style={estilos.tabsContenedor}>
        <Pressable
          style={[estilos.tabBoton, tab === 'QR' && estilos.tabBotonActivo]}
          onPress={() => setTab('QR')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'QR' }}
        >
          <QrCode color={tab === 'QR' ? COLOR.primario : COLOR.textoSuave} size={18} />
          <Text style={[estilos.tabTexto, tab === 'QR' && estilos.tabTextoActivo]}>{PAYMENT_TEXT.TAB_QR}</Text>
        </Pressable>

        <Pressable
          style={[estilos.tabBoton, tab === 'TRANSFERENCIA' && estilos.tabBotonActivo]}
          onPress={() => setTab('TRANSFERENCIA')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'TRANSFERENCIA' }}
        >
          <Landmark color={tab === 'TRANSFERENCIA' ? COLOR.primario : COLOR.textoSuave} size={18} />
          <Text style={[estilos.tabTexto, tab === 'TRANSFERENCIA' && estilos.tabTextoActivo]}>
            {PAYMENT_TEXT.TAB_TRANSFER}
          </Text>
        </Pressable>
      </View>

      {/* Contenido según la pestaña seleccionada */}
      {tab === 'QR' ? (
        <>
          <Text style={estilos.suave}>
            {bancoAnfitrion} · {nombreAnfitrion}
          </Text>

          {expired ? (
            <ExpiredNotice onBack={onBack} />
          ) : (
            <QrView
              qrImagen={qrImagen}
              qrCadena={qrCadena}
              onZoom={() => onZoom(qrImagen || qrCadena)}
            />
          )}

          <GlossButton gloss={glosaTexto} copied={glosaCopiada} onCopied={() => setGlosaCopiada(true)} />

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
        /* Pestaña de Transferencia Bancaria Directa */
        <View style={estilos.tarjetaTransferencia}>
          {/* Titular */}
          <View style={estilos.itemBanco}>
            <View style={estilos.itemBancoHeader}>
              <Text style={estilos.etiquetaBanco}>{PAYMENT_TEXT.HOST_BENEFICIARY}</Text>
              <User color={COLOR.primario} size={16} />
            </View>
            <Text style={estilos.valorBanco}>{nombreAnfitrion}</Text>
          </View>

          {/* Banco */}
          <View style={estilos.itemBanco}>
            <View style={estilos.itemBancoHeader}>
              <Text style={estilos.etiquetaBanco}>{PAYMENT_TEXT.BANK}</Text>
              <Landmark color={COLOR.primario} size={16} />
            </View>
            <Text style={estilos.valorBanco}>{bancoAnfitrion}</Text>
          </View>

          {/* Cuenta Bancaria */}
          <View style={estilos.itemBanco}>
            <View style={estilos.itemBancoHeader}>
              <Text style={estilos.etiquetaBanco}>{PAYMENT_TEXT.ACCOUNT_NUMBER}</Text>
              <Pressable style={estilos.botonCopiarPequeno} onPress={() => void copiarCuenta()}>
                {cuentaCopiada ? <Check color={COLOR.primario} size={12} /> : <Copy color={COLOR.primario} size={12} />}
                <Text style={estilos.botonCopiarTexto}>
                  {cuentaCopiada ? PAYMENT_TEXT.ACCOUNT_COPIED : PAYMENT_TEXT.COPY_ACCOUNT}
                </Text>
              </Pressable>
            </View>
            <Text style={estilos.valorCuenta}>{cuentaAnfitrion}</Text>
          </View>

          {/* Glosa / Motivo */}
          <View style={estilos.itemBanco}>
            <Text style={estilos.etiquetaBanco}>{PAYMENT_TEXT.GLOSS}</Text>
            <GlossButton gloss={glosaTexto} copied={glosaCopiada} onCopied={() => setGlosaCopiada(true)} />
          </View>
        </View>
      )}

      {/* Banner de información de seguridad y confirmación */}
      <View style={estilos.bannerInfo}>
        <ShieldCheck color={COLOR.primario} size={20} />
        <Text style={estilos.bannerInfoTexto}>
          {tab === 'QR'
            ? 'Escanea el código QR del anfitrión o presiona Pagar para confirmar tu estadía al instante.'
            : PAYMENT_TEXT.DIRECT_TRANSFER_INFO}
        </Text>
      </View>

      {/* Botón principal de pago */}
      {onConfirmar ? (
        <View style={estilos.ancho}>
          <Boton
            variante="primario"
            titulo={confirmando ? 'Procesando pago…' : 'Pagar'}
            deshabilitado={confirmando}
            onPress={() => void onConfirmar()}
          />
        </View>
      ) : null}

      {/* Cuenta regresiva si aplica */}
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

/** Componente que dibuja el QR: renderiza imagen real del anfitrión o código SVG */
function QrView({
  qrImagen,
  qrCadena,
  onZoom,
}: {
  qrImagen: string | null | undefined;
  qrCadena: string;
  onZoom: () => void;
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={PAYMENT_TEXT.ZOOM_QR_LABEL}
        onPress={onZoom}
        style={estilos.marcoQr}
      >
        <View style={estilos.fondoQr}>
          {qrImagen ? (
            <Image
              source={{ uri: qrImagen }}
              style={{ width: QR_SIZE, height: QR_SIZE, borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : (
            <QRCode value={qrCadena} size={QR_SIZE} color={COLOR.texto} backgroundColor={COLOR.blanco} />
          )}
        </View>
        {/* Esquinas decorativas de enfoque */}
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

/** Aviso de código QR vencido */
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

/** Botón de glosa que copia al portapapeles */
function GlossButton({ gloss, copied, onCopied }: { gloss: string; copied: boolean; onCopied: () => void }) {
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(gloss);
      onCopied();
    } catch {}
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
