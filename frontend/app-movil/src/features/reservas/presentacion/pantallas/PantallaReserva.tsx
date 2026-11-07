// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaReserva.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla que muestra la reserva creada, el tiempo que queda para pagar y el botón "Pagar".
// PARA QUÉ SIRVE: Es el puente entre el agente (que crea la reserva) y el pago (que NO usa agente).
// SIN ÉL: Después de reservar el usuario no vería el plazo ni cómo pagar.
// NO VA AQUÍ: Cómo se paga: solo avisa con `alPagar(reserva)`.
// ======================================================================
// Diseño: mockup "4. Reserva y cuenta regresiva". Solo se muestran datos reales de la reserva:
// no hay foto ni ubicación en el modelo, por eso la cabecera usa un ícono en lugar de una imagen.

import { Building2, Calendar, CalendarCheck, CheckCircle2, Hourglass, Lock, Moon, Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';
import { MINUTOS_BLOQUEO } from '../../constantes';
import type { CasosReservas } from '../../domain/interfaces';
import type { Reserva } from '../../domain/modelos';
import { formatearSegundos, useReserva } from '../useReserva';

interface Props {
  casos: CasosReservas;
  reservaId: string;
  alPagar: (reserva: Reserva) => void;
}

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

export function PantallaReserva({ casos, reservaId, alPagar }: Props) {
  const { reserva, error, segundos, sePuedePagar } = useReserva(casos, reservaId);
  const insets = useSafeAreaInsets();

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
            <Building2 color={COLOR.primario} size={44} strokeWidth={1.5} />
            <View style={estilos.codigo}>
              <Text style={estilos.codigoTexto}>#{reserva.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
          <View style={estilos.cuerpo}>
            <Text style={estilos.titulo}>{reserva.alojamientoTitulo}</Text>
            <Text style={estilos.suave}>{reserva.unidadNombre}</Text>
          </View>
        </View>

        {/* Cuenta regresiva */}
        {pendiente && segundos !== null && (
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
            <CheckCircle2 color={COLOR.exito} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.confirmadaTitulo}>¡Reserva confirmada!</Text>
              <Text style={estilos.confirmadaTexto}>Código de check-in: {reserva.codigoCheckin}</Text>
            </View>
          </View>
        )}

        {error && <Text style={estilos.error}>Sin conexión con el servidor: se muestra el último dato guardado.</Text>}

        {pendiente && (
          <View style={estilos.seguro}>
            <Lock color={COLOR.primario} size={16} />
            <Text style={estilos.seguroTexto}>Transacción cifrada y protegida con QR Simple</Text>
          </View>
        )}
      </ScrollView>

      {pendiente && (
        <View style={[estilos.barraInferior, { paddingBottom: ESPACIO.l + insets.bottom }]}>
          <Boton
            titulo={`Pagar ahora • ${total}`}
            onPress={() => alPagar(reserva)}
            deshabilitado={!sePuedePagar}
          />
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
  portada: { height: 120, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
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

  confirmada: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, backgroundColor: COLOR.exitoFondo, borderWidth: 1, borderColor: COLOR.exitoBorde, borderRadius: RADIO.tarjeta, padding: ESPACIO.l },
  confirmadaTitulo: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.exito },
  confirmadaTexto: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.texto },

  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { fontFamily: FUENTE.medio, fontSize: 12, color: COLOR.textoSuave },
  error: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.error, textAlign: 'center' },

  barraInferior: { padding: ESPACIO.l, backgroundColor: COLOR.tarjeta, borderTopWidth: 1, borderTopColor: COLOR.borde, ...SOMBRA_FLOTANTE },
});
