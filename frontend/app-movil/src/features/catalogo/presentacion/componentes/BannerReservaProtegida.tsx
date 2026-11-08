// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BannerReservaProtegida.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El banner azul "Reserva protegida" del explorador.
// PARA QUÉ SIRVE: Explicar en una frase que las fechas se bloquean al reservar y que el pago es con QR.
// SIN ÉL: El explorador no diría por qué reservar aquí es seguro.
// NO VA AQUÍ: Lógica: es solo un texto con diseño.
// ======================================================================
// El texto describe lo que la app hace de verdad: bloquea las fechas mientras se paga (MINUTOS_BLOQUEO) y cobra con QR Simple.

import { QrCode, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';

export function BannerReservaProtegida() {
  return (
    <View style={estilos.caja} accessible accessibilityLabel="Reserva protegida. Bloqueo de inventario inmediato con QR y pago bancario nacional boliviano.">
      <View style={{ flex: 1, gap: ESPACIO.xs }}>
        <View style={estilos.titulo}>
          <ShieldCheck color="#fff" size={18} />
          <Text style={estilos.tituloTexto}>RESERVA PROTEGIDA</Text>
        </View>
        <Text style={estilos.texto}>Bloqueo de inventario inmediato con QR y pago bancario nacional boliviano.</Text>
      </View>
      <View style={estilos.qr}>
        <QrCode color="#fff" size={28} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    padding: ESPACIO.l,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.primario,
  },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  tituloTexto: { fontFamily: FUENTE.fuerte, fontSize: 13, letterSpacing: 0.8, color: '#fff' },
  texto: { fontFamily: FUENTE.normal, fontSize: 14, lineHeight: 20, color: '#eff6ff' },
  qr: { width: 48, height: 48, borderRadius: RADIO.control, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
