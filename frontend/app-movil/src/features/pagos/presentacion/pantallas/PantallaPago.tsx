// ======================================================================
// ARCHIVO: pagos/presentacion/pantallas/PantallaPago.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de pago: desglose, QR (QR Simple BNB) y estado.
// PARA QUÉ SIRVE: Es el pago "sin agente": un flujo directo y predecible.
// SIN ÉL: El usuario no tendría cómo pagar la reserva.
// NO VA AQUÍ: Reglas ni llamadas HTTP.
// ======================================================================
// Diseño: mockup "5. Pago con QR Simple". El QR se dibuja con react-native-qrcode-svg.
// Solo se muestran datos reales del pago (descuento y cargo de servicio vienen de MS-03).

import { CheckCircle2, Clock, Lock, QrCode, Tag, XCircle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { CasosPagos } from '../../domain/interfaces';
import type { SolicitudPago } from '../../domain/modelos';
import { formatearSegundos, usePago } from '../usePago';

interface Props {
  casos: CasosPagos;
  solicitud: SolicitudPago;
  alTerminar: (completado: boolean) => void;
}

export function PantallaPago({ casos, solicitud, alTerminar }: Props) {
  const { pago, error, cargando, segundosQr, reintentar, simular } = usePago(casos, solicitud);

  if (cargando && !pago) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={COLOR.primario} size="large" />
        <Text style={estilos.suave}>Preparando tu pago…</Text>
      </View>
    );
  }
  if (!pago) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error ?? 'No se pudo iniciar el pago.'}</Text>
        <Boton titulo="Reintentar" onPress={() => void reintentar()} />
      </View>
    );
  }

  const dinero = (n: number) => `${pago.moneda} ${n.toFixed(2)}`;

  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      {/* Resumen */}
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Resumen de pago</Text>
        <Fila etiqueta="Alojamiento" valor={dinero(pago.subtotal)} />
        {pago.descuento > 0 && (
          <Fila
            etiqueta="Descuento"
            valor={`- ${dinero(pago.descuento)}`}
            color={COLOR.aviso}
            icono={<Tag color={COLOR.aviso} size={16} />}
          />
        )}
        <Fila etiqueta="Cargo de servicio" valor={dinero(pago.cargoServicio)} />
        <View style={estilos.separador} />
        <View style={estilos.filaTotal}>
          <Text style={estilos.totalEtiqueta}>Total a pagar</Text>
          <Text style={estilos.total}>{dinero(pago.total)}</Text>
        </View>
      </View>

      {/* QR */}
      {pago.estado === 'PENDIENTE' && (
        <View style={[estilos.tarjeta, { alignItems: 'center' }]}>
          <View style={estilos.iconoQr}>
            <QrCode color={COLOR.primario} size={26} />
          </View>
          <Text style={estilos.tituloCentro}>Paga con QR Simple</Text>

          {pago.qr ? (
            <>
              <Text style={estilos.suave}>
                {pago.qr.banco} · {pago.qr.alias}
              </Text>
              <View style={estilos.marcoQr}>
                <View style={estilos.fondoQr}>
                  <QRCode value={pago.qr.cadena} size={200} color={COLOR.texto} backgroundColor="#ffffff" />
                </View>
              </View>
              <View style={estilos.glosa}>
                <Text style={estilos.glosaTexto}>
                  Glosa: <Text selectable style={estilos.glosaValor}>{pago.qr.glosa}</Text>
                </Text>
              </View>
            </>
          ) : (
            <Text style={estilos.aviso}>
              El QR ya no está disponible en esta sesión. Vuelve a la reserva e inténtalo de nuevo.
            </Text>
          )}

          <View style={estilos.espera}>
            <ActivityIndicator color={COLOR.primario} />
            <Text style={estilos.esperaTexto}>Esperando la confirmación del banco…</Text>
          </View>

          {simular && (
            <View style={{ alignSelf: 'stretch' }}>
              <Boton
                variante="secundario"
                titulo="Simular pago del banco (demo)"
                onPress={() => void simular()}
              />
            </View>
          )}

          {segundosQr !== null && (
            <View style={estilos.expira}>
              <Clock color={COLOR.textoSuave} size={16} />
              <Text style={estilos.suave}>
                {segundosQr > 0 ? 'El código QR expira en ' : 'El código QR expiró'}
                {segundosQr > 0 && <Text style={estilos.expiraTiempo}>{formatearSegundos(segundosQr)}</Text>}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Resultado */}
      {pago.estado === 'COMPLETADO' && (
        <View style={[estilos.tarjeta, estilos.exito]}>
          <CheckCircle2 color={COLOR.exito} size={40} />
          <Text style={estilos.exitoTitulo}>¡Pago confirmado!</Text>
          {pago.comprobantes.map((c) => (
            <Text key={c.id} style={estilos.suave}>
              {c.tipo} {c.numero}
            </Text>
          ))}
          <View style={{ alignSelf: 'stretch' }}>
            <Boton titulo="Ver mi reserva" onPress={() => alTerminar(true)} />
          </View>
        </View>
      )}

      {(pago.estado === 'FALLIDO' || pago.estado === 'REEMBOLSADO') && (
        <View style={[estilos.tarjeta, estilos.fallo]}>
          <XCircle color={COLOR.error} size={40} />
          <Text style={estilos.error}>{pago.estado === 'FALLIDO' ? 'El pago falló.' : 'El pago fue reembolsado.'}</Text>
          <View style={{ alignSelf: 'stretch' }}>
            <Boton variante="contorno" titulo="Volver" onPress={() => alTerminar(false)} />
          </View>
        </View>
      )}

      {error && <Text style={estilos.error}>{error}</Text>}

      <View style={estilos.seguro}>
        <Lock color={COLOR.primario} size={16} />
        <Text style={estilos.seguroTexto}>Transacción protegida · Pago con QR Simple</Text>
      </View>
    </ScrollView>
  );
}

function Fila({
  etiqueta,
  valor,
  color,
  icono,
}: {
  etiqueta: string;
  valor: string;
  color?: string;
  icono?: React.ReactNode;
}) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.filaEtiqueta}>
        {icono}
        <Text style={[estilos.texto, color ? { color } : null]}>{etiqueta}</Text>
      </View>
      <Text style={[estilos.valor, color ? { color } : null]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, gap: ESPACIO.m, backgroundColor: COLOR.fondo },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, padding: ESPACIO.l, gap: ESPACIO.m, borderWidth: 1, borderColor: COLOR.borde },
  titulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto },
  tituloCentro: { fontFamily: FUENTE.titulo, fontSize: 22, color: COLOR.texto, textAlign: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  filaTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  separador: { height: 1, backgroundColor: COLOR.borde },
  texto: { fontFamily: FUENTE.normal, fontSize: 15, color: COLOR.texto },
  valor: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.texto },
  totalEtiqueta: { fontFamily: FUENTE.semi, fontSize: 16, color: COLOR.texto },
  total: { fontFamily: FUENTE.tituloFuerte, fontSize: 26, color: COLOR.primario },
  suave: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.textoSuave, textAlign: 'center' },

  iconoQr: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  marcoQr: { padding: ESPACIO.m, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.campo, borderWidth: 1, borderColor: '#bfdbfe' },
  fondoQr: { padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: '#fff' },
  glosa: { backgroundColor: COLOR.campo, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.s },
  glosaTexto: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  glosaValor: { fontFamily: FUENTE.fuerte, color: COLOR.texto },
  espera: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  esperaTexto: { flex: 1, fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.texto },
  expira: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  expiraTiempo: { fontFamily: FUENTE.fuerte, color: COLOR.texto },

  exito: { alignItems: 'center', backgroundColor: COLOR.exitoFondo, borderColor: COLOR.exitoBorde },
  exitoTitulo: { fontFamily: FUENTE.titulo, fontSize: 22, color: COLOR.exito },
  fallo: { alignItems: 'center', backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },

  aviso: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.aviso, textAlign: 'center' },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, textAlign: 'center' },
  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { fontFamily: FUENTE.medio, fontSize: 12, color: COLOR.textoSuave },
});
