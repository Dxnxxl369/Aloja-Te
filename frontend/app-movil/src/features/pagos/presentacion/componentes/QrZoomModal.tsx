// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/QrZoomModal.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El QR en grande, sobre fondo oscuro, que se cierra al tocar en cualquier lugar.
// PARA QUÉ SIRVE: Escanear el QR con comodidad desde otro celular.
// SIN ÉL: Solo se vería el QR pequeño de la tarjeta.
// NO VA AQUÍ: Saber si está abierto: lo decide la pantalla con `visible`.
// ======================================================================

import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLOR } from '../../../../shared/ui/tema';
import { QR_ZOOM_SIZE } from '../../constantes';
import { PAYMENT_TEXT } from '../texts';
import { estilos } from './QrZoomModal.styles';

interface Props {
  visible: boolean;
  /** El contenido del QR; sin él el recuadro queda vacío. */
  qrData: string | null;
  onClose: () => void;
}

export function QrZoomModal({ visible, qrData, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={estilos.fondo} onPress={onClose} accessibilityLabel={PAYMENT_TEXT.CLOSE_ZOOM_LABEL}>
        <View style={estilos.caja}>
          {qrData ? <QRCode value={qrData} size={QR_ZOOM_SIZE} color={COLOR.texto} backgroundColor={COLOR.blanco} /> : null}
          <Text style={estilos.suave}>{PAYMENT_TEXT.TAP_TO_CLOSE}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}
