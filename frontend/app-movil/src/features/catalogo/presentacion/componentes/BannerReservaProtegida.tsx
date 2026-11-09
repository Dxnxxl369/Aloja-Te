// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BannerReservaProtegida.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El banner azul "Reserva protegida" del explorador.
// PARA QUÉ SIRVE: Explicar en una frase que las fechas se bloquean al reservar y que el pago es con QR.
// SIN ÉL: El explorador no diría por qué reservar aquí es seguro.
// NO VA AQUÍ: Lógica: es solo un texto con diseño.
// ======================================================================
// El texto describe lo que la app hace de verdad: bloquea las fechas mientras se paga (MINUTOS_BLOQUEO) y cobra con QR Simple.

import { QrCode, ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './BannerReservaProtegida.styles';

export function BannerReservaProtegida() {
  return (
    <View style={estilos.caja} accessible accessibilityLabel="Reserva protegida. Bloqueo de inventario inmediato con QR y pago bancario nacional boliviano.">
      <View style={{ flex: 1, gap: ESPACIO.xs }}>
        <View style={estilos.titulo}>
          <ShieldCheck color={COLOR.blanco} size={18} />
          <Text style={estilos.tituloTexto}>RESERVA PROTEGIDA</Text>
        </View>
        <Text style={estilos.texto}>Bloqueo de inventario inmediato con QR y pago bancario nacional boliviano.</Text>
      </View>
      <View style={estilos.qr}>
        <QrCode color={COLOR.blanco} size={28} />
      </View>
    </View>
  );
}
