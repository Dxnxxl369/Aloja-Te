// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaMisReservas.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pestaña "Reservas": tus reservas separadas en activas y anteriores, con su estado, fechas y total.
// PARA QUÉ SIRVE: Volver a ver una reserva (y su PIN de check-in) o pagar una pendiente sin pasar por el asistente.
// SIN ÉL: Una reserva solo se vería justo después de crearla.
// NO VA AQUÍ: El detalle de una reserva (es PantallaReserva): aquí solo avisa con `alAbrir`.
// ======================================================================
// Sin internet muestra lo último guardado en el celular (lo decide el repositorio).
// No hay mockup de esta pantalla: usa los mismos componentes y colores del resto de la app.

import { CalendarDays, ChevronRight, Hourglass, KeyRound } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Chip } from '../../../../shared/ui/Chip';
import { formatearRango } from '../../../../shared/ui/fechas';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { CasosReservas } from '../../domain/interfaces';
import type { Reserva } from '../../domain/modelos';
import type { FiltroReservas } from '../organizarReservas';
import { contarReservas, organizarReservas } from '../organizarReservas';
import { formatearSegundos } from '../useReserva';

interface Props {
  casos: CasosReservas;
  clienteId: string;
  alAbrir: (reservaId: string) => void;
  /** Si se pasa, la pantalla vacía ofrece ir a explorar alojamientos. */
  alExplorar?: () => void;
}

const TEXTO_ESTADO: Record<Reserva['estado'], string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  CHECKIN_REALIZADO: 'Check-in realizado',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
  RECHAZADA_COMPENSADA: 'Rechazada',
};

const TONO_ESTADO: Record<Reserva['estado'], Tono> = {
  PENDIENTE_PAGO: 'aviso',
  CONFIRMADA: 'exito',
  CHECKIN_REALIZADO: 'exito',
  COMPLETADA: 'neutro',
  CANCELADA: 'error',
  EXPIRADA: 'error',
  RECHAZADA_COMPENSADA: 'error',
};

const FILTROS: { clave: FiltroReservas; etiqueta: string }[] = [
  { clave: 'TODAS', etiqueta: 'Todas' },
  { clave: 'ACTIVAS', etiqueta: 'Activas' },
  { clave: 'ANTERIORES', etiqueta: 'Anteriores' },
];

/** Hace que la pantalla se vuelva a dibujar cada segundo mientras `activo`: así las cuentas regresivas avanzan. */
function useLatido(activo: boolean): void {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => setN((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [activo]);
}

export function PantallaMisReservas({ casos, clienteId, alAbrir, alExplorar }: Props) {
  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroReservas>('TODAS');

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setReservas(await casos.listarReservasDeCliente(clienteId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar tus reservas');
    }
  }, [casos, clienteId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const refrescar = async () => {
    setActualizando(true);
    await cargar();
    setActualizando(false);
  };

  const cuentas = useMemo(() => contarReservas(reservas ?? []), [reservas]);
  const visibles = useMemo(() => organizarReservas(reservas ?? [], filtro), [reservas, filtro]);
  // Solo hay reloj mientras haya alguna reserva con plazo corriendo en lo que se ve.
  useLatido(visibles.some((r) => casos.segundosRestantes(r) !== null));

  if (reservas === null && !error) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={COLOR.primario} size="large" />
      </View>
    );
  }

  if (reservas === null) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error}</Text>
        <Boton titulo="Reintentar" onPress={() => void cargar()} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={estilos.pagina}
      refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} tintColor={COLOR.primario} colors={[COLOR.primario]} />}
    >
      {error && <Text style={estilos.error}>Sin conexión: se muestra lo último guardado.</Text>}

      {reservas.length === 0 ? (
        <View style={estilos.vacio}>
          <View style={estilos.vacioIcono}>
            <CalendarDays color={COLOR.primario} size={32} strokeWidth={1.5} />
          </View>
          <Text style={estilos.vacioTitulo}>Aún no tienes reservas</Text>
          <Text style={[estilos.suave, { textAlign: 'center' }]}>
            Elige un alojamiento y resérvalo tú mismo o con ayuda del asistente.
          </Text>
          {alExplorar ? <Boton titulo="Explorar alojamientos" onPress={alExplorar} /> : null}
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
            {FILTROS.map((f) => (
              <Chip
                key={f.clave}
                etiqueta={`${f.etiqueta} · ${cuentas[f.clave]}`}
                seleccionado={filtro === f.clave}
                estiloSeleccionado="solido"
                onPress={() => setFiltro(f.clave)}
              />
            ))}
          </ScrollView>

          {visibles.length === 0 ? (
            <View style={estilos.vacio}>
              <Text style={estilos.vacioTitulo}>{filtro === 'ACTIVAS' ? 'No tienes reservas activas' : 'No hay reservas anteriores'}</Text>
              <Text style={[estilos.suave, { textAlign: 'center' }]}>
                {filtro === 'ACTIVAS' ? 'Las que esperan pago o ya están confirmadas aparecen aquí.' : 'Aquí se guardan las completadas, canceladas y vencidas.'}
              </Text>
            </View>
          ) : (
            visibles.map((r) => <TarjetaReserva key={r.id} reserva={r} segundos={casos.segundosRestantes(r)} alAbrir={() => alAbrir(r.id)} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

function TarjetaReserva({ reserva: r, segundos, alAbrir }: { reserva: Reserva; segundos: number | null; alAbrir: () => void }) {
  const pagable = r.estado === 'PENDIENTE_PAGO' && segundos !== null && segundos > 0;
  const vencida = r.estado === 'PENDIENTE_PAGO' && segundos === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reserva en ${r.alojamientoTitulo}, ${TEXTO_ESTADO[r.estado]}, ${formatearRango(r.checkIn, r.checkOut)}`}
      onPress={alAbrir}
      style={({ pressed }) => [estilos.tarjeta, pressed && { backgroundColor: COLOR.campo }]}
    >
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {r.alojamientoTitulo}
        </Text>
        <ChevronRight color={COLOR.textoSuave} size={20} />
      </View>
      <Text style={estilos.suave}>{r.unidadNombre}</Text>

      <View style={estilos.fechas}>
        <CalendarDays color={COLOR.primario} size={16} />
        <Text style={estilos.fechasTexto}>
          {formatearRango(r.checkIn, r.checkOut)} · {r.noches} noche{r.noches === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={estilos.pie}>
        <Insignia texto={TEXTO_ESTADO[r.estado]} tono={TONO_ESTADO[r.estado]} />
        <Text style={estilos.total}>
          {r.moneda} {r.total.toFixed(2)}
        </Text>
      </View>

      {pagable && (
        <View style={estilos.plazo}>
          <View style={estilos.plazoTexto}>
            <Hourglass color={COLOR.aviso} size={16} />
            <Text style={estilos.plazoTitulo}>Paga en {formatearSegundos(segundos)}</Text>
          </View>
          <Boton titulo="Pagar ahora" onPress={alAbrir} />
        </View>
      )}
      {vencida && (
        <View style={estilos.vencida}>
          <Text style={estilos.vencidaTexto}>El plazo para pagar terminó: las fechas ya pueden reservarse por otros.</Text>
        </View>
      )}
      {r.estado === 'CONFIRMADA' && (
        <View style={estilos.pin}>
          <KeyRound color={COLOR.exito} size={16} />
          <Text style={estilos.pinTexto}>Toca para ver tu PIN de check-in</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.m, paddingBottom: ESPACIO.xxl, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, gap: ESPACIO.m, backgroundColor: COLOR.fondo },
  filtros: { gap: ESPACIO.s },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, padding: ESPACIO.l, gap: ESPACIO.s },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.s },
  titulo: { flex: 1, fontFamily: FUENTE.titulo, fontSize: 18, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  fechas: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  fechasTexto: { flexShrink: 1, fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.texto },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACIO.xs },
  total: { fontFamily: FUENTE.tituloFuerte, fontSize: 18, color: COLOR.primario },
  plazo: { gap: ESPACIO.s, padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: COLOR.avisoFondo, borderWidth: 1, borderColor: COLOR.avisoBorde },
  plazoTexto: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  plazoTitulo: { fontFamily: FUENTE.semi, fontSize: 14, color: '#92400e', fontVariant: ['tabular-nums'] },
  vencida: { padding: ESPACIO.m, borderRadius: RADIO.control, backgroundColor: COLOR.errorFondo, borderWidth: 1, borderColor: COLOR.errorBorde },
  vencidaTexto: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.error },
  pin: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.exitoFondo, borderRadius: RADIO.control, padding: ESPACIO.s },
  pinTexto: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.exito },
  vacio: { alignItems: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.xxl },
  vacioIcono: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  vacioTitulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto, textAlign: 'center' },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, textAlign: 'center' },
});
