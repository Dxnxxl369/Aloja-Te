// ======================================================================
// ARCHIVO: anfitrion/presentacion/pantallas/PantallaDashboard.tsx
// QUÉ ES: Tablero ejecutivo móvil del anfitrión: métricas clave y llegadas recientes.
// ======================================================================

import { Building2, CalendarCheck, CheckCircle2, DollarSign, Sparkles, Users } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSesion } from '../../../../core';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { ReservaRecienteAnfitrion, ResumenKpis } from '../../domain/modelos';
import { TarjetaKpi } from '../componentes/TarjetaKpi';

interface Props {
  repo: {
    obtenerDashboard: (anfitrionId: string) => Promise<{
      kpis: ResumenKpis;
      reservasRecientes: ReservaRecienteAnfitrion[];
    }>;
  };
}

export function PantallaDashboard({ repo }: Props) {
  const insets = useSafeAreaInsets();
  const { sesion } = useSesion();
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [kpis, setKpis] = useState<ResumenKpis | null>(null);
  const [reservas, setReservas] = useState<ReservaRecienteAnfitrion[]>([]);

  const cargarDatos = useCallback(async () => {
    if (!sesion?.usuarioId) return;
    try {
      const data = await repo.obtenerDashboard(sesion.usuarioId);
      setKpis(data.kpis);
      setReservas(data.reservasRecientes);
    } catch (e) {
      console.warn('Error al cargar dashboard:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [repo, sesion?.usuarioId]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const onRefresh = () => {
    setRefrescando(true);
    void cargarDatos();
  };

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={[estilos.contenedor, { paddingTop: insets.top + ESPACIO.m }]}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[COLOR.primario]} />}
    >
      {/* 1. Cabecera Ejecutiva */}
      <View style={estilos.cabeceraEjecutiva}>
        <View style={estilos.filaBadge}>
          <View style={estilos.badgeVerificado}>
            <Sparkles color="#93c5fd" size={13} />
            <Text style={estilos.badgeTexto}>Panel Anfitrión Verificado</Text>
          </View>
        </View>
        <Text style={estilos.saludo}>Hola, {sesion?.nombre || 'Anfitrión'}</Text>
        <Text style={estilos.subtituloCabecera}>
          Gestiona tus propiedades, cobros y reservas en tiempo real.
        </Text>
      </View>

      {/* 2. Grid de KPIs */}
      {cargando && !kpis ? (
        <View style={estilos.centro}>
          <ActivityIndicator color={COLOR.primario} size="large" />
        </View>
      ) : (
        <>
          <View style={estilos.gridKpis}>
            <TarjetaKpi
              titulo="Ingresos Mes"
              valor={`Bs. ${kpis?.ingresosTotales.toLocaleString() || '0'}`}
              subtexto="+15% este mes"
              Icono={DollarSign}
              colorIcono={COLOR.primario}
            />
            <TarjetaKpi
              titulo="Reservas"
              valor={`${kpis?.reservasTotales || 0} hechas`}
              subtexto="En curso y activas"
              Icono={CalendarCheck}
              colorIcono={COLOR.exitoOscuro}
            />
            <TarjetaKpi
              titulo="Propiedades"
              valor={`${kpis?.alojamientosActivos || 0} activas`}
              subtexto="Catálogo verificado"
              Icono={Building2}
              colorIcono={COLOR.primario}
            />
            <TarjetaKpi
              titulo="Ocupación"
              valor={`${kpis?.tasaOcupacion || 0}%`}
              subtexto="Promedio nacional"
              Icono={Users}
              colorIcono={COLOR.avisoOscuro}
            />
          </View>

          {/* 3. Próximas Llegadas & Reservas */}
          <View style={estilos.seccion}>
            <View style={estilos.cabeceraSeccion}>
              <Text style={estilos.tituloSeccion}>Próximas Llegadas</Text>
              <Text style={estilos.contadorReservas}>{reservas.length} reservas</Text>
            </View>

            {reservas.length === 0 ? (
              <View style={estilos.cajaVacia}>
                <CalendarCheck color={COLOR.textoSuave} size={32} />
                <Text style={estilos.textoVacio}>No tienes reservas activas en este momento.</Text>
              </View>
            ) : (
              reservas.map((r) => (
                <View key={r.id} style={estilos.tarjetaReserva}>
                  <View style={estilos.filaReservaHeader}>
                    <Text style={estilos.huesped}>{r.huespedNombre}</Text>
                    <View style={estilos.badgeEstadoReserva}>
                      <CheckCircle2 color={COLOR.exitoOscuro} size={13} />
                      <Text style={estilos.badgeEstadoTexto}>{r.estado}</Text>
                    </View>
                  </View>
                  <Text style={estilos.alojamientoTitulo} numberOfLines={1}>
                    {r.alojamientoTitulo}
                  </Text>
                  <View style={estilos.filaReservaDetalle}>
                    <Text style={estilos.fechas}>
                      {r.checkIn} → {r.checkOut}
                    </Text>
                    <Text style={estilos.monto}>Bs. {r.total}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLOR.fondo,
  },
  contenedor: {
    padding: ESPACIO.m,
    paddingBottom: 90,
    gap: ESPACIO.l,
  },
  centro: {
    padding: ESPACIO.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabeceraEjecutiva: {
    backgroundColor: '#0f172a',
    borderRadius: RADIO.tarjeta + 6,
    padding: ESPACIO.l,
    gap: ESPACIO.s,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filaBadge: {
    flexDirection: 'row',
  },
  badgeVerificado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  badgeTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: '#93c5fd',
  },
  saludo: {
    ...FUENTE.tituloFuerte,
    fontSize: 22,
    color: '#f8fafc',
  },
  subtituloCabecera: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: '#94a3b8',
    lineHeight: 18,
  },
  gridKpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACIO.m,
  },
  seccion: {
    gap: ESPACIO.m,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloSeccion: {
    ...FUENTE.titulo,
    fontSize: TAMANO.subtitulo,
    color: COLOR.texto,
  },
  contadorReservas: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  cajaVacia: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.xl,
    alignItems: 'center',
    gap: ESPACIO.s,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  textoVacio: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
    textAlign: 'center',
  },
  tarjetaReserva: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    gap: 6,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  filaReservaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  huesped: {
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  badgeEstadoReserva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLOR.exitoFondo,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
    borderColor: COLOR.exitoBorde,
  },
  badgeEstadoTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: COLOR.exitoOscuro,
  },
  alojamientoTitulo: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  filaReservaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLOR.campo,
  },
  fechas: {
    ...FUENTE.medio,
    fontSize: TAMANO.pequeno,
    color: COLOR.texto,
  },
  monto: {
    ...FUENTE.fuerte,
    fontSize: TAMANO.cuerpo,
    color: COLOR.primario,
  },
});
