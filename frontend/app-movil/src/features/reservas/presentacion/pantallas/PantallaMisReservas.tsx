// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaMisReservas.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla "Mis reservas" (se abre desde Perfil): tus reservas separadas en activas y anteriores, con su estado, fechas y total.
// PARA QUÉ SIRVE: Volver a ver una reserva (y su PIN de check-in) o pagar una pendiente sin pasar por el agente.
// SIN ÉL: Una reserva solo se vería justo después de crearla.
// NO VA AQUÍ: El detalle de una reserva (es PantallaReserva): aquí solo avisa con `alAbrir`.
// ======================================================================
// Sin internet muestra lo último guardado en el celular (lo decide el repositorio).
// No hay mockup de esta pantalla: usa los mismos componentes y colores del resto de la app.

import { CalendarDays, ChevronRight, Hourglass, KeyRound } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Chip } from '../../../../shared/ui/Chip';
import { formatearDinero } from '../../../../shared/ui/dinero';
import { formatearRango } from '../../../../shared/ui/fechas';
import { pluralize } from '../../../../shared/ui/plural';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import { formatearSegundos } from '../../../../shared/ui/tiempo';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR } from '../../../../shared/ui/tema';
import type { CasosReservas } from '../../domain/interfaces';
import type { Reserva } from '../../domain/modelos';
import { EsqueletoReservas } from '../componentes/EsqueletoReservas';
import type { FiltroReservas } from '../organizarReservas';
import { contarReservas, organizarReservas } from '../organizarReservas';
import { FILTROS, TEXTO_ESTADO, TONO_ESTADO } from '../texts';
import { useLatido } from '../useLatido';
import { estilos } from './PantallaMisReservas.styles';

interface Props {
  casos: CasosReservas;
  clienteId: string;
  alAbrir: (reservaId: string) => void;
  /** Si se pasa, la pantalla vacía ofrece ir a explorar alojamientos. */
  alExplorar?: () => void;
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

  if (reservas === null && !error) return <EsqueletoReservas />;

  if (reservas === null) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error}</Text>
        <Boton titulo={COMMON_TEXT.RETRY} onPress={() => void cargar()} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={estilos.pagina}
      refreshControl={<RefreshControl refreshing={actualizando} onRefresh={() => void refrescar()} tintColor={COLOR.primario} colors={[COLOR.primario]} />}
    >
      {error ? <Text style={estilos.error}>Sin conexión: se muestra lo último guardado.</Text> : null}

      {reservas.length === 0 ? (
        <View style={estilos.vacio}>
          <View style={estilos.vacioIcono}>
            <CalendarDays color={COLOR.primario} size={32} strokeWidth={1.5} />
          </View>
          <Text style={estilos.vacioTitulo}>Aún no tienes reservas</Text>
          <Text style={[estilos.suave, { textAlign: 'center' }]}>
            Elige un alojamiento y resérvalo tú mismo o con ayuda del agente.
          </Text>
          {alExplorar ? <Boton titulo="Explorar alojamientos" onPress={alExplorar} /> : null}
        </View>
      ) : (
        <>
          {/* flexGrow: 0: sin esto la fila de filtros se estira hasta llenar toda la pantalla (la página usa flexGrow: 1). */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.filtrosScroll} contentContainerStyle={estilos.filtros}>
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
          {formatearRango(r.checkIn, r.checkOut)} · {r.noches} {pluralize(r.noches, 'noche', 'noches')}
        </Text>
      </View>

      <View style={estilos.pie}>
        <Insignia texto={TEXTO_ESTADO[r.estado]} tono={TONO_ESTADO[r.estado]} />
        <Text style={estilos.total}>
          {formatearDinero(r.total, r.moneda)}
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
