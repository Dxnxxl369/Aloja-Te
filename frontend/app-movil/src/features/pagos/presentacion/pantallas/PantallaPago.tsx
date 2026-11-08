// ======================================================================
// ARCHIVO: pagos/presentacion/pantallas/PantallaPago.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de pago: desglose, QR (QR Simple BNB) y estado.
// PARA QUÉ SIRVE: Es el pago "sin agente": un flujo directo y predecible.
// SIN ÉL: El usuario no tendría cómo pagar la reserva.
// NO VA AQUÍ: Reglas ni llamadas HTTP.
// ======================================================================
// Diseño: mockup "5. Pago con QR Simple". El QR se dibuja con react-native-qrcode-svg.
// Solo se muestran datos reales del pago (descuento y cargo de servicio vienen de MS-03).

import * as Clipboard from 'expo-clipboard';
import { Check, CheckCircle2, Clock, Copy, Lock, Maximize2, QrCode, Tag, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';
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
  const [qrGrande, setQrGrande] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // El "¡Copiado!" se apaga solo a los 2 segundos.
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

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
  const vencido = segundosQr === 0;
  const idCorto = pago.id.slice(0, 8).toUpperCase();
  const glosa = pago.qr?.glosa ?? null;
  const copiarGlosa = async () => {
    if (!glosa) return;
    try {
      await Clipboard.setStringAsync(glosa);
      setCopiado(true);
    } catch {
      /* si el portapapeles falla, la glosa sigue visible para copiarla a mano */
    }
  };
  const horaLimite =
    segundosQr !== null && segundosQr > 0
      ? new Date(Date.now() + segundosQr * 1000).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
      : null;

  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      {/* Resumen */}
      <View style={estilos.tarjeta}>
        <View style={estilos.filaTotal}>
          <Text style={estilos.titulo}>Resumen de pago</Text>
          <Verificado variante="insignia" />
        </View>
        <Fila etiqueta="Alojamiento" valor={dinero(pago.subtotal)} />
        {pago.descuento > 0 && (
          <Fila
            etiqueta="Descuento"
            valor={`- ${dinero(pago.descuento)}`}
            color={COLOR.avisoOscuro}
            icono={<Tag color={COLOR.avisoOscuro} size={16} />}
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
              {vencido ? (
                <View style={estilos.vencido}>
                  <XCircle color={COLOR.error} size={32} />
                  <Text style={estilos.vencidoTitulo}>El código QR ha vencido</Text>
                  <Text style={estilos.suave}>
                    Si ya pagaste, espera unos segundos: tu reserva se confirma sola. Si no, vuelve a la reserva.
                  </Text>
                  <View style={{ alignSelf: 'stretch' }}>
                    <Boton variante="contorno" titulo="Volver a la reserva" onPress={() => alTerminar(false)} />
                  </View>
                </View>
              ) : (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ampliar código QR"
                    onPress={() => setQrGrande(true)}
                    style={estilos.marcoQr}
                  >
                    <View style={estilos.fondoQr}>
                      <QRCode value={pago.qr.cadena} size={200} color={COLOR.texto} backgroundColor="#ffffff" />
                    </View>
                    {/* Esquinas de enfoque, solo decorativas: no tapan el código. */}
                    <View pointerEvents="none" style={[estilos.esquina, estilos.arribaIzquierda]} />
                    <View pointerEvents="none" style={[estilos.esquina, estilos.arribaDerecha]} />
                    <View pointerEvents="none" style={[estilos.esquina, estilos.abajoIzquierda]} />
                    <View pointerEvents="none" style={[estilos.esquina, estilos.abajoDerecha]} />
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setQrGrande(true)} style={estilos.ampliar}>
                    <Maximize2 color={COLOR.primario} size={16} />
                    <Text style={estilos.ampliarTexto}>Ampliar QR</Text>
                  </Pressable>
                </>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copiado ? 'Glosa copiada' : `Copiar glosa ${pago.qr.glosa}`}
                onPress={() => void copiarGlosa()}
                style={estilos.glosa}
              >
                <Text style={estilos.glosaTexto}>
                  Glosa: <Text style={estilos.glosaValor}>{pago.qr.glosa}</Text>
                </Text>
                {copiado ? <Check color={COLOR.exitoOscuro} size={16} /> : <Copy color={COLOR.textoSuave} size={16} />}
                {copiado ? <Text style={estilos.copiado}>¡Copiado!</Text> : null}
              </Pressable>
              <Text style={estilos.suave}>Transacción {idCorto}</Text>
              {horaLimite ? <Text style={estilos.suave}>Paga antes de las {horaLimite}</Text> : null}
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
          <Text style={estilos.exitoTitulo}>¡Pago aprobado!</Text>
          <Text style={estilos.suave}>Transacción {idCorto}</Text>
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
          <Text style={estilos.error}>
            {pago.estado === 'FALLIDO' ? 'No se pudo completar el pago' : 'El pago fue reembolsado'}
          </Text>
          <Text style={estilos.suave}>Transacción {idCorto}</Text>
          <View style={{ alignSelf: 'stretch' }}>
            <Boton variante="contorno" titulo="Volver" onPress={() => alTerminar(false)} />
          </View>
        </View>
      )}

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <View style={estilos.seguro}>
        <Lock color={COLOR.primario} size={16} />
        <Text style={estilos.seguroTexto}>Transacción protegida · Pago con QR Simple</Text>
      </View>

      <Modal visible={qrGrande} transparent animationType="fade" onRequestClose={() => setQrGrande(false)}>
        <Pressable style={estilos.fondoModal} onPress={() => setQrGrande(false)} accessibilityLabel="Cerrar QR ampliado">
          <View style={estilos.cajaModal}>
            {pago.qr && <QRCode value={pago.qr.cadena} size={280} color={COLOR.texto} backgroundColor="#ffffff" />}
            <Text style={estilos.suave}>Toca para cerrar</Text>
          </View>
        </Pressable>
      </Modal>
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
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  tituloCentro: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto, textAlign: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  filaTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  separador: { height: 1, backgroundColor: COLOR.borde },
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  valor: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  totalEtiqueta: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  total: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, color: COLOR.primario },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, textAlign: 'center' },

  iconoQr: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  marcoQr: { padding: ESPACIO.m, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.campo, borderWidth: 1, borderColor: '#bfdbfe' },
  fondoQr: { padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: '#fff' },
  glosa: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, minHeight: 44, backgroundColor: COLOR.campo, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.s },
  copiado: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.exitoOscuro },
  esquina: { position: 'absolute', width: 22, height: 22, borderColor: COLOR.primario },
  arribaIzquierda: { top: 4, left: 4, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  arribaDerecha: { top: 4, right: 4, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  abajoIzquierda: { bottom: 4, left: 4, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  abajoDerecha: { bottom: 4, right: 4, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  glosaTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
  glosaValor: { ...FUENTE.fuerte, color: COLOR.texto },
  espera: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  esperaTexto: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.texto },
  expira: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  expiraTiempo: { ...FUENTE.fuerte, color: COLOR.texto },

  ampliar: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs, minHeight: 44 },
  ampliarTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
  vencido: { alignSelf: 'stretch', alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.errorFondo, borderWidth: 1, borderColor: COLOR.errorBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.l },
  vencidoTitulo: { ...FUENTE.titulo, fontSize: TAMANO.subtitulo, color: COLOR.errorOscuro },
  fondoModal: { flex: 1, backgroundColor: COLOR.scrim, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.xl },
  cajaModal: { backgroundColor: '#fff', borderRadius: RADIO.tarjeta, padding: ESPACIO.xl, alignItems: 'center', gap: ESPACIO.m },

  exito: { alignItems: 'center', backgroundColor: COLOR.exitoFondo, borderColor: COLOR.exitoBorde },
  exitoTitulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.exitoOscuro },
  fallo: { alignItems: 'center', backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },

  aviso: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.avisoOscuro, textAlign: 'center' },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { ...FUENTE.medio, fontSize: TAMANO.pequeno, color: COLOR.textoSuave },
});
