// ======================================================================
// ARCHIVO: anfitrion/presentacion/pantallas/PantallaFinanzas.tsx
// QUÉ ES: Módulo de finanzas, balance disponible y liquidaciones bancarias del anfitrión.
// ======================================================================

import { ArrowDownRight, ArrowUpRight, Building, CheckCircle2, CreditCard, DollarSign, Landmark, ShieldCheck, Wallet } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSesion } from '../../../../core';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { LiquidacionAnfitrion, PerfilAnfitrionDetalle } from '../../domain/modelos';

interface Props {
  repo: {
    obtenerPerfil: (id: string) => Promise<PerfilAnfitrionDetalle>;
    obtenerLiquidaciones: (id: string) => Promise<LiquidacionAnfitrion[]>;
  };
}

export function PantallaFinanzas({ repo }: Props) {
  const insets = useSafeAreaInsets();
  const { sesion } = useSesion();
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [perfil, setPerfil] = useState<PerfilAnfitrionDetalle | null>(null);
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionAnfitrion[]>([]);
  const [desembolsando, setDesembolsando] = useState(false);

  const cargar = useCallback(async () => {
    if (!sesion?.usuarioId) return;
    try {
      const [p, l] = await Promise.all([
        repo.obtenerPerfil(sesion.usuarioId),
        repo.obtenerLiquidaciones(sesion.usuarioId),
      ]);
      setPerfil(p);
      setLiquidaciones(l);
    } catch (e) {
      console.warn('Error al cargar finanzas:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [repo, sesion?.usuarioId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const onRefresh = () => {
    setRefrescando(true);
    void cargar();
  };

  const handleSolicitarDesembolso = () => {
    setDesembolsando(true);
    setTimeout(() => {
      setDesembolsando(false);
      Alert.alert(
        'Solicitud Enviada',
        `Se ha programado la transferencia interbancaria hacia tu cuenta ${perfil?.bancoNombre || 'Banco'} N° ${perfil?.numeroCuentaBancaria || ''} por el monto total disponible.`
      );
    }, 1200);
  };

  const totalLiquidado = liquidaciones.reduce((acc, l) => acc + l.montoNeto, 0);

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={[estilos.contenedor, { paddingTop: insets.top + ESPACIO.m }]}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[COLOR.primario]} />}
    >
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>Finanzas & Liquidaciones</Text>
        <Text style={estilos.subtitulo}>Balance de cobros y transferencias bancarias automáticas</Text>
      </View>

      {/* Tarjeta de Balance */}
      <View style={estilos.tarjetaBalance}>
        <View style={estilos.filaBalanceCabecera}>
          <Text style={estilos.etiquetaBalance}>Balance Disponible para Desembolso</Text>
          <View style={estilos.iconoWallet}>
            <Wallet color="#93c5fd" size={20} />
          </View>
        </View>

        <Text style={estilos.montoGrande}>Bs. {totalLiquidado.toLocaleString()}</Text>

        <View style={estilos.cuentaVinculadaCaja}>
          <Landmark color="#93c5fd" size={16} />
          <Text style={estilos.cuentaVinculadaTexto}>
            {perfil?.bancoNombre || 'Banco Mercantil Santa Cruz'} · N° {perfil?.numeroCuentaBancaria || '4010987654321'}
          </Text>
        </View>

        <View style={{ marginTop: ESPACIO.s }}>
          <Boton
            titulo={desembolsando ? 'Procesando transferencia…' : 'Solicitar Desembolso Inmediato'}
            variante="primario"
            deshabilitado={desembolsando}
            onPress={handleSolicitarDesembolso}
          />
        </View>
      </View>

      {/* Reglas y comisiones */}
      <View style={estilos.tarjetaInfo}>
        <View style={estilos.filaInfo}>
          <ShieldCheck color={COLOR.primario} size={18} />
          <Text style={estilos.textoInfo}>
            Comisión de servicio fija: <Text style={{ ...FUENTE.semi }}>10%</Text>. Las transferencias a cuentas BNB y BMSC se acreditan en el mismo día.
          </Text>
        </View>
      </View>

      {/* Historial de Liquidaciones */}
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Historial de Liquidaciones</Text>

        {cargando ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLOR.primario} />
          </View>
        ) : (
          liquidaciones.map((l) => (
            <View key={l.id} style={estilos.tarjetaLiquidacion}>
              <View style={estilos.filaLiqHeader}>
                <View style={estilos.iconoTransaccion}>
                  <ArrowDownRight color={COLOR.exitoOscuro} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.concepto}>Liquidación de Reservas</Text>
                  <Text style={estilos.fecha}>{l.fecha} · {l.referencia}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={estilos.montoNeto}>+ Bs. {l.montoNeto.toLocaleString()}</Text>
                  <Text style={estilos.comisionTexto}>Comisión: -Bs. {l.comision}</Text>
                </View>
              </View>

              <View style={estilos.filaEstadoLiq}>
                <View style={estilos.badgeEstadoLiq}>
                  <CheckCircle2 color={COLOR.exitoOscuro} size={12} />
                  <Text style={estilos.badgeEstadoLiqTexto}>{l.estado}</Text>
                </View>
                <Text style={estilos.brutoTexto}>Bruto: Bs. {l.montoBruto.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  cabecera: {
    gap: 2,
  },
  titulo: {
    ...FUENTE.tituloFuerte,
    fontSize: 22,
    color: COLOR.texto,
  },
  subtitulo: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  centro: {
    padding: ESPACIO.xl,
    alignItems: 'center',
  },
  tarjetaBalance: {
    backgroundColor: '#0f172a',
    borderRadius: RADIO.tarjeta + 6,
    padding: ESPACIO.l,
    gap: ESPACIO.m,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filaBalanceCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiquetaBalance: {
    ...FUENTE.medio,
    fontSize: TAMANO.pequeno,
    color: '#94a3b8',
  },
  iconoWallet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  montoGrande: {
    ...FUENTE.tituloFuerte,
    fontSize: 32,
    color: '#ffffff',
  },
  cuentaVinculadaCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIO.control,
    padding: ESPACIO.s,
    paddingHorizontal: ESPACIO.m,
  },
  cuentaVinculadaTexto: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: '#e2e8f0',
  },
  tarjetaInfo: {
    backgroundColor: COLOR.primarioSuave,
    borderRadius: RADIO.control,
    padding: ESPACIO.m,
    borderWidth: 1,
    borderColor: COLOR.primarioBorde,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoInfo: {
    flex: 1,
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.texto,
    lineHeight: 18,
  },
  seccion: {
    gap: ESPACIO.m,
  },
  tituloSeccion: {
    ...FUENTE.titulo,
    fontSize: TAMANO.subtitulo,
    color: COLOR.texto,
  },
  tarjetaLiquidacion: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    gap: ESPACIO.s,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  filaLiqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
  },
  iconoTransaccion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR.exitoFondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concepto: {
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  fecha: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  montoNeto: {
    ...FUENTE.fuerte,
    fontSize: 16,
    color: COLOR.exitoOscuro,
  },
  comisionTexto: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  filaEstadoLiq: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLOR.campo,
  },
  badgeEstadoLiq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLOR.exitoFondo,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIO.pildora,
  },
  badgeEstadoLiqTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: COLOR.exitoOscuro,
  },
  brutoTexto: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
});
