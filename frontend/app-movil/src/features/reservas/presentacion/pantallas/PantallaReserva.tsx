// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaReserva.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla que muestra la reserva creada, el tiempo que queda para pagar y el botón "Pagar".
// PARA QUÉ SIRVE: Es el puente entre el agente (que crea la reserva) y el pago (que NO usa agente).
// SIN ÉL: Después de reservar el usuario no vería el plazo ni cómo pagar.
// NO VA AQUÍ: Cómo se paga: solo avisa con `alPagar(reserva)`.
// ======================================================================
// Diseño: mockup "4. Reserva y cuenta regresiva". Solo se muestran datos reales de la reserva:
// no hay foto ni ubicación en el modelo, por eso la cabecera usa un ícono en lugar de una imagen.

import { Building2, Calendar, CalendarCheck, CheckCircle2, CreditCard, Hourglass, Lock, MapPin, Moon, Users, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';
import { Verificado } from '../../../../shared/ui/Verificado';
import { MINUTOS_BLOQUEO } from '../../constantes';
import type { CasosReservas } from '../../domain/interfaces';
import type { FichaAlojamiento, Reserva } from '../../domain/modelos';
import { formatearSegundos, useReserva } from '../useReserva';

interface Props {
  casos: CasosReservas;
  reservaId: string;
  alPagar: (reserva: Reserva) => void;
  /**
   * Trae la foto y el lugar del alojamiento (la reserva solo guarda el título). Lo conecta app/.
   * Si falla o no se pasa, la portada usa un ícono: nunca bloquea la pantalla.
   */
  cargarFicha?: (alojamientoId: string) => Promise<FichaAlojamiento | null>;
  /** true cuando el usuario viene de pagar: la reserva se confirma sola cuando el servidor la actualice. */
  pagoRecibido?: boolean;
}

/** Segundos de espera antes de avisar que la confirmación tarda más de lo normal. */
const ESPERA_LARGA_S = 45;

const TEXTO_ESTADO: Record<Reserva['estado'], string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  CHECKIN_REALIZADO: 'Check-in realizado',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada (no se pagó a tiempo)',
  RECHAZADA_COMPENSADA: 'Rechazada',
};

const TONO_ESTADO: Record<Reserva['estado'], Tono> = {
  PENDIENTE_PAGO: 'aviso',
  CONFIRMADA: 'exito',
  CHECKIN_REALIZADO: 'exito',
  COMPLETADA: 'exito',
  CANCELADA: 'error',
  EXPIRADA: 'error',
  RECHAZADA_COMPENSADA: 'error',
};

export function PantallaReserva({ casos, reservaId, alPagar, cargarFicha, pagoRecibido = false }: Props) {
  const { reserva, error, segundos, sePuedePagar, cancelar, cancelando, errorCancelar } = useReserva(casos, reservaId);
  const insets = useSafeAreaInsets();
  const [esperaLarga, setEsperaLarga] = useState(false);
  const [ficha, setFicha] = useState<FichaAlojamiento | null>(null);
  const alojamientoId = reserva?.alojamientoId;

  // La foto y el lugar llegan aparte y sin apuro: mientras tanto se ve el ícono.
  useEffect(() => {
    if (!alojamientoId || !cargarFicha) return;
    let vivo = true;
    cargarFicha(alojamientoId).then(
      (f) => vivo && setFicha(f),
      () => undefined,
    );
    return () => {
      vivo = false;
    };
  }, [alojamientoId, cargarFicha]);

  const confirmarCancelacion = () =>
    Alert.alert(
      '¿Cancelar la reserva?',
      'Se liberan las fechas para otros huéspedes. Si ya pagaste, no canceles: espera la confirmación del banco.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar reserva', style: 'destructive', onPress: () => void cancelar() },
      ],
    );
  useEffect(() => {
    if (!pagoRecibido) return;
    const t = setTimeout(() => setEsperaLarga(true), ESPERA_LARGA_S * 1000);
    return () => clearTimeout(t);
  }, [pagoRecibido]);

  if (!reserva) {
    return (
      <View style={estilos.centro}>
        {error ? <Text style={estilos.error}>{error}</Text> : <ActivityIndicator color={COLOR.primario} />}
      </View>
    );
  }

  const pendiente = reserva.estado === 'PENDIENTE_PAGO';
  const total = `${reserva.moneda} ${reserva.total.toFixed(2)}`;
  const plazoTotal = MINUTOS_BLOQUEO * 60;
  const progreso = segundos === null ? 0 : Math.min(1, Math.max(0, segundos / plazoTotal));
  const vencido = segundos === 0;

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.pagina}>
        {/* Cabecera del alojamiento */}
        <View style={estilos.tarjeta}>
          <View style={estilos.portada}>
            {ficha?.fotoUrl ? (
              <Image
                source={{ uri: ficha.fotoUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                accessibilityLabel={`Foto de ${reserva.alojamientoTitulo}`}
              />
            ) : (
              <Building2 color={COLOR.primario} size={44} strokeWidth={1.5} />
            )}
            {ficha?.verificado ? (
              <View style={estilos.verificado}>
                <Verificado texto="Alojamiento verificado" variante="sobreFoto" />
              </View>
            ) : null}
            <View style={estilos.codigo}>
              <Text style={estilos.codigoTexto}>#{reserva.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
          <View style={estilos.cuerpo}>
            <Text style={estilos.titulo}>{reserva.alojamientoTitulo}</Text>
            <Text style={estilos.suave}>{reserva.unidadNombre}</Text>
            {ficha?.ubicacion ? (
              <View style={estilos.lugar}>
                <MapPin color={COLOR.primario} size={16} />
                <Text style={estilos.suave} numberOfLines={2}>
                  {ficha.ubicacion}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Cuenta regresiva */}
        {pendiente && pagoRecibido && (
          <View style={estilos.confirmando}>
            {esperaLarga ? <Hourglass color={COLOR.aviso} size={22} /> : <ActivityIndicator color={COLOR.primario} />}
            <View style={{ flex: 1 }}>
              <Text style={estilos.confirmandoTitulo}>Pago recibido, confirmando tu reserva…</Text>
              <Text style={estilos.confirmandoTexto}>
                {esperaLarga
                  ? 'Está tardando más de lo normal. Tu pago quedó registrado: esta pantalla se actualiza sola y puedes volver a revisar en unos minutos.'
                  : 'Esto toma unos segundos. No cierres la app.'}
              </Text>
            </View>
          </View>
        )}

        {pendiente && !pagoRecibido && segundos !== null && (
          <View style={estilos.cuenta}>
            <View style={estilos.cuentaCabecera}>
              <View style={estilos.cuentaIcono}>
                <Hourglass color={COLOR.aviso} size={22} />
              </View>
              <Text style={estilos.cuentaTitulo}>
                {vencido ? 'El tiempo para pagar terminó' : 'Fechas bloqueadas temporalmente'}
              </Text>
              <View style={[estilos.reloj, vencido && { backgroundColor: COLOR.error }]}>
                <Text style={estilos.relojTexto}>{formatearSegundos(segundos)}</Text>
              </View>
            </View>
            <Text style={estilos.cuentaDescripcion}>
              {vencido
                ? 'Las fechas ya pueden reservarse por otros huéspedes. Vuelve al asistente para hacer una nueva reserva.'
                : `Tu cupo está garantizado ${MINUTOS_BLOQUEO} minutos mientras completas el pago. Pasado el plazo, la habitación quedará disponible para otros huéspedes.`}
            </Text>
            <View style={estilos.barra}>
              <View style={[estilos.barraRelleno, { width: `${Math.round(progreso * 100)}%`, backgroundColor: vencido ? COLOR.error : COLOR.aviso }]} />
            </View>
          </View>
        )}

        {/* Detalle */}
        <View style={estilos.tarjeta}>
          <View style={[estilos.cuerpo, { gap: ESPACIO.m }]}>
            <View style={estilos.estado}>
              <Text style={estilos.etiquetaMayus}>ESTADO ACTUAL</Text>
              <Insignia texto={TEXTO_ESTADO[reserva.estado]} tono={TONO_ESTADO[reserva.estado]} />
            </View>

            <Fila icono={<Calendar color={COLOR.textoSuave} size={20} />} etiqueta="Entrada (check-in)" valor={reserva.checkIn} />
            <Fila icono={<CalendarCheck color={COLOR.textoSuave} size={20} />} etiqueta="Salida (check-out)" valor={reserva.checkOut} />
            <Fila icono={<Moon color={COLOR.textoSuave} size={20} />} etiqueta="Duración" valor={`${reserva.noches} noche${reserva.noches === 1 ? '' : 's'}`} />
            <Fila icono={<Users color={COLOR.textoSuave} size={20} />} etiqueta="Huéspedes" valor={String(reserva.huespedes)} />

            <View style={estilos.resumen}>
              <View style={estilos.filaPrecio}>
                <Text style={estilos.suave}>
                  {reserva.moneda} {reserva.precioNoche.toFixed(2)} × {reserva.noches} noche{reserva.noches === 1 ? '' : 's'}
                </Text>
                <Text style={estilos.suave}>{total}</Text>
              </View>
              {pendiente && <Text style={estilos.nota}>El cargo de servicio se calcula en la pantalla de pago.</Text>}
              <View style={estilos.separador} />
              <View style={estilos.filaPrecio}>
                <Text style={estilos.etiquetaMayus}>TOTAL ALOJAMIENTO</Text>
                <Text style={estilos.total}>{total}</Text>
              </View>
            </View>
          </View>
        </View>

        {reserva.estado === 'CONFIRMADA' && (
          <View style={estilos.confirmada}>
            <CheckCircle2 color={COLOR.exito} size={36} />
            <Text style={estilos.confirmadaTitulo}>¡Tu reserva está confirmada!</Text>
            <Text style={estilos.confirmadaTexto}>Muestra este PIN en recepción para hacer el check-in:</Text>
            <View style={estilos.pinCaja} accessibilityLabel={`PIN de check-in ${reserva.codigoCheckin.split('').join(' ')}`}>
              {reserva.codigoCheckin.split('').map((d, i) => (
                <Text key={i} style={estilos.pinDigito}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        )}

        {error && <Text style={estilos.error}>Sin conexión con el servidor: se muestra el último dato guardado.</Text>}

        {pendiente && !pagoRecibido && (
          <View style={estilos.seguro}>
            <Lock color={COLOR.primario} size={16} />
            <Text style={estilos.seguroTexto}>Transacción cifrada y protegida con QR Simple</Text>
          </View>
        )}
      </ScrollView>

      {pendiente && !pagoRecibido && (
        <View style={[estilos.barraInferior, { paddingBottom: ESPACIO.l + insets.bottom }]}>
          <Boton
            titulo={`Pagar ahora • ${total}`}
            onPress={() => alPagar(reserva)}
            deshabilitado={!sePuedePagar || cancelando}
            iconoIzquierda={(c) => <CreditCard color={c} size={20} />}
          />
          {errorCancelar ? (
            <Text accessibilityRole="alert" style={estilos.error}>
              {errorCancelar}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar esta solicitud de reserva"
            accessibilityState={{ disabled: cancelando, busy: cancelando }}
            disabled={cancelando}
            onPress={confirmarCancelacion}
            hitSlop={8}
            style={[estilos.cancelar, cancelando && { opacity: 0.5 }]}
          >
            {cancelando ? <ActivityIndicator size="small" color={COLOR.textoSuave} /> : <X color={COLOR.textoSuave} size={18} />}
            <Text style={estilos.cancelarTexto}>{cancelando ? 'Cancelando…' : 'Cancelar esta solicitud de reserva'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Fila({ icono, etiqueta, valor }: { icono: ReactNode; etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.filaEtiqueta}>
        {icono}
        <Text style={estilos.texto}>{etiqueta}</Text>
      </View>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, backgroundColor: COLOR.fondo },

  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, overflow: 'hidden' },
  portada: { height: 160, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  verificado: { position: 'absolute', left: ESPACIO.m, bottom: ESPACIO.m },
  lugar: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, marginTop: ESPACIO.xs },
  codigo: { position: 'absolute', right: ESPACIO.m, bottom: ESPACIO.m, backgroundColor: '#fff', borderRadius: RADIO.control, paddingHorizontal: ESPACIO.s, paddingVertical: 2 },
  codigoTexto: { fontFamily: FUENTE.semi, fontSize: 11, color: COLOR.textoSuave, letterSpacing: 0.5 },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.xs },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 24, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  texto: { fontFamily: FUENTE.normal, fontSize: 15, color: COLOR.texto },
  valor: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.texto },

  cuenta: { backgroundColor: COLOR.avisoFondo, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.avisoBorde, padding: ESPACIO.l, gap: ESPACIO.m },
  cuentaCabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  cuentaIcono: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  cuentaTitulo: { flex: 1, fontFamily: FUENTE.titulo, fontSize: 17, lineHeight: 22, color: '#92400e' },
  reloj: { backgroundColor: COLOR.aviso, borderRadius: RADIO.pildora, paddingHorizontal: ESPACIO.m, paddingVertical: 4 },
  relojTexto: { fontFamily: FUENTE.fuerte, fontSize: 14, color: '#fff', fontVariant: ['tabular-nums'] },
  cuentaDescripcion: { fontFamily: FUENTE.normal, fontSize: 13, lineHeight: 19, color: '#92400e' },
  barra: { height: 6, borderRadius: 3, backgroundColor: '#fde68a', overflow: 'hidden' },
  barraRelleno: { height: 6, borderRadius: 3 },

  estado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  etiquetaMayus: { fontFamily: FUENTE.medio, fontSize: 12, letterSpacing: 0.8, color: COLOR.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filaEtiqueta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  resumen: { backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.l, gap: ESPACIO.s },
  filaPrecio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nota: { fontFamily: FUENTE.normal, fontSize: 12, color: COLOR.textoSuave },
  separador: { height: 1, backgroundColor: COLOR.borde, marginVertical: ESPACIO.xs },
  total: { fontFamily: FUENTE.tituloFuerte, fontSize: 24, color: COLOR.primario },

  confirmada: { alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.exitoFondo, borderWidth: 1, borderColor: COLOR.exitoBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.xl },
  confirmadaTitulo: { fontFamily: FUENTE.titulo, fontSize: 22, color: COLOR.exito, textAlign: 'center' },
  confirmadaTexto: { fontFamily: FUENTE.normal, fontSize: 15, color: COLOR.texto, textAlign: 'center' },
  pinCaja: { flexDirection: 'row', gap: ESPACIO.s, marginTop: ESPACIO.s },
  pinDigito: {
    width: 44,
    height: 56,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 56,
    fontFamily: FUENTE.fuerte,
    fontSize: 28,
    color: COLOR.texto,
    backgroundColor: '#fff',
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.exitoBorde,
    overflow: 'hidden',
  },
  confirmando: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.primarioSuave, borderWidth: 1, borderColor: '#bfdbfe', borderRadius: RADIO.tarjeta, padding: ESPACIO.l },
  confirmandoTitulo: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.primario },
  confirmandoTexto: { fontFamily: FUENTE.normal, fontSize: 13, lineHeight: 19, color: COLOR.texto, marginTop: 2 },

  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { fontFamily: FUENTE.medio, fontSize: 12, color: COLOR.textoSuave },
  error: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.error, textAlign: 'center' },

  barraInferior: { padding: ESPACIO.l, gap: ESPACIO.s, backgroundColor: COLOR.tarjeta, borderTopWidth: 1, borderTopColor: COLOR.borde, ...SOMBRA_FLOTANTE },
  cancelar: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  cancelarTexto: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.textoSuave },
});
