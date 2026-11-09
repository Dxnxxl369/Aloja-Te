// ======================================================================
// ARCHIVO: pagos/presentacion/componentes/PaymentSummary.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La tarjeta "Resumen de pago": alojamiento, descuento (si hay), cargo de servicio y total a pagar.
// PARA QUÉ SIRVE: Que el usuario vea cuánto paga y por qué antes de escanear el QR.
// SIN ÉL: El desglose estaría mezclado con el QR dentro de PantallaPago.
// NO VA AQUÍ: Cálculos de precios (los entrega MS-03 ya hechos) ni el QR.
// ======================================================================
// Solo se dibuja lo real: el descuento aparece únicamente si MS-03 lo envió.

import { Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { FilaDato } from '../../../../shared/ui/FilaDato';
import { COLOR } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';
import type { Pago } from '../../domain/modelos';
import { PAYMENT_TEXT } from '../texts';
import { estilos } from './PaymentSummary.styles';

interface Props {
  pago: Pago;
  /** Escribe un monto con la moneda del pago, por ejemplo "BOB 120.00". */
  money: (amount: number) => string;
}

export function PaymentSummary({ pago, money }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.fila}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {PAYMENT_TEXT.SUMMARY_TITLE}
        </Text>
        <Verificado variante="insignia" />
      </View>
      <FilaDato etiqueta={PAYMENT_TEXT.LODGING} valor={money(pago.subtotal)} />
      {pago.descuento > 0 && (
        <FilaDato
          etiqueta={PAYMENT_TEXT.DISCOUNT}
          valor={`- ${money(pago.descuento)}`}
          color={COLOR.avisoOscuro}
          icono={<Tag color={COLOR.avisoOscuro} size={16} />}
        />
      )}
      <FilaDato etiqueta={PAYMENT_TEXT.SERVICE_FEE} valor={money(pago.cargoServicio)} />
      <View style={estilos.separador} />
      <View style={estilos.fila}>
        <Text style={estilos.totalEtiqueta}>{PAYMENT_TEXT.TOTAL}</Text>
        <Text style={estilos.total}>{money(pago.total)}</Text>
      </View>
    </View>
  );
}
