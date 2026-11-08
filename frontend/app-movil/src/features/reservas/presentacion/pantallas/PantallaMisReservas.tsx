// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaMisReservas.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La lista de las reservas del usuario, con su estado y fechas.
// PARA QUÉ SIRVE: Volver a ver una reserva (y su PIN de check-in) sin pasar por el asistente.
// SIN ÉL: Una reserva solo se vería justo después de crearla.
// NO VA AQUÍ: El detalle de una reserva (es PantallaReserva): aquí solo avisa con `alAbrir`.
// ======================================================================
// Sin internet muestra lo último guardado en el celular (lo decide el repositorio).

import { CalendarDays, ChevronRight, KeyRound } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { CasosReservas } from '../../domain/interfaces';
import type { Reserva } from '../../domain/modelos';

interface Props {
  casos: CasosReservas;
  clienteId: string;
  alAbrir: (reservaId: string) => void;
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

export function PantallaMisReservas({ casos, clienteId, alAbrir }: Props) {
  const [reservas, setReservas] = useState<Reserva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

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
      refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} tintColor={COLOR.primario} />}
    >
      {error && <Text style={estilos.error}>Sin conexión: se muestra lo último guardado.</Text>}

      {reservas.length === 0 ? (
        <View style={estilos.vacio}>
          <CalendarDays color={COLOR.textoSuave} size={40} strokeWidth={1.5} />
          <Text style={estilos.vacioTitulo}>Aún no tienes reservas</Text>
          <Text style={estilos.suave}>Pídele al asistente que te ayude a reservar tu primer alojamiento.</Text>
        </View>
      ) : (
        reservas.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={`Reserva en ${r.alojamientoTitulo}, ${TEXTO_ESTADO[r.estado]}`}
            onPress={() => alAbrir(r.id)}
            style={({ pressed }) => [estilos.tarjeta, pressed && { backgroundColor: COLOR.campo }]}
          >
            <View style={estilos.cabecera}>
              <Text style={estilos.titulo} numberOfLines={2}>
                {r.alojamientoTitulo}
              </Text>
              <ChevronRight color={COLOR.textoSuave} size={20} />
            </View>
            <Text style={estilos.suave}>{r.unidadNombre}</Text>
            <Text style={estilos.fechas}>
              {r.checkIn} → {r.checkOut} · {r.noches} noche{r.noches === 1 ? '' : 's'}
            </Text>
            <View style={estilos.pie}>
              <Insignia texto={TEXTO_ESTADO[r.estado]} tono={TONO_ESTADO[r.estado]} />
              <Text style={estilos.total}>
                {r.moneda} {r.total.toFixed(2)}
              </Text>
            </View>
            {r.estado === 'CONFIRMADA' && (
              <View style={estilos.pin}>
                <KeyRound color={COLOR.exito} size={16} />
                <Text style={estilos.pinTexto}>Toca para ver tu PIN de check-in</Text>
              </View>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.m, paddingBottom: ESPACIO.xxl, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.l, gap: ESPACIO.m, backgroundColor: COLOR.fondo },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, padding: ESPACIO.l, gap: ESPACIO.s },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.s },
  titulo: { flex: 1, fontFamily: FUENTE.titulo, fontSize: 18, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  fechas: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.texto },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACIO.xs },
  total: { fontFamily: FUENTE.fuerte, fontSize: 16, color: COLOR.texto },
  pin: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, backgroundColor: COLOR.exitoFondo, borderRadius: RADIO.control, padding: ESPACIO.s },
  pinTexto: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.exito },
  vacio: { alignItems: 'center', gap: ESPACIO.s, paddingVertical: ESPACIO.xxl },
  vacioTitulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, textAlign: 'center' },
});
