// ======================================================================
// ARCHIVO: app/navegacion.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Las pantallas de la sesión iniciada y cómo se pasa de una a otra: Agente -> Reserva -> Pago.
// PARA QUÉ SIRVE: Conecta los features sin que se conozcan entre sí: aquí se arma la solicitud de pago a partir de la reserva.
// SIN ÉL: Cada feature tendría que importar al otro para navegar.
// NO VA AQUÍ: Reglas de negocio (están en cada feature) ni el login (es App.tsx).
// ======================================================================
// Cada pantalla va dentro de un <Marco>: cabecera + franja de "sin internet / pendientes".
// Las pantallas son componentes de módulo (no funciones en línea) para que React Navigation
// no las vuelva a montar en cada render y la conversación del agente no se pierda.

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, View } from 'react-native';
import { MODELO_IA, modeloLocal, useEstadoModelo, useEstadoSync, useSesion } from '../core';
import { PantallaAgente } from '../features/agente';
import { PantallaModeloIa } from '../features/ia';
import { PantallaPago } from '../features/pagos';
import type { SolicitudPago } from '../features/pagos';
import { PantallaMisReservas, PantallaReserva } from '../features/reservas';
import { AvisoSinRed } from '../shared/ui/AvisoSinRed';
import { Encabezado } from '../shared/ui/Encabezado';
import { COLOR } from '../shared/ui/tema';
import type { Features } from './features';

type Rutas = {
  Agente: undefined;
  MisReservas: undefined;
  ModeloIa: undefined;
  Reserva: { reservaId: string; pagoRecibido?: boolean };
  Pago: { solicitud: SolicitudPago };
};

const Stack = createNativeStackNavigator<Rutas>();
const ContextoFeatures = createContext<Features | null>(null);

function useFeatures(): Features {
  const f = useContext(ContextoFeatures);
  if (!f) throw new Error('useFeatures debe usarse dentro de <NavegacionApp>');
  return f;
}

/** Cabecera + aviso de conexión + el contenido de la pantalla. */
function Marco({
  titulo,
  alVolver,
  alMisReservas,
  children,
}: {
  titulo: string;
  alVolver?: () => void;
  alMisReservas?: () => void;
  children: ReactNode;
}) {
  const { sesion, cerrarSesion } = useSesion();
  const sync = useEstadoSync();

  const abrirCuenta = () =>
    Alert.alert(sesion?.nombre || 'Mi cuenta', sesion?.email, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.fondo }}>
      <Encabezado titulo={titulo} alVolver={alVolver} alPerfil={abrirCuenta} alMisReservas={alMisReservas} />
      <AvisoSinRed conectado={sync.conectado} pendientes={sync.pendientes} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/** IA local: se carga al abrir el agente (si el celular la soporta y está descargada) y se libera al salir. */
function useIaLocal() {
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const estado = await modeloLocal.refrescar();
        if (vivo && estado === 'LISTO') await modeloLocal.cargar();
      } catch (e) {
        console.warn('IA local no disponible, el agente usará la nube o las reglas', e instanceof Error ? e.message : e);
      }
    })();
    return () => {
      vivo = false;
      void modeloLocal.liberar().catch(() => undefined);
    };
  }, []);
}

function RutaAgente({ navigation }: NativeStackScreenProps<Rutas, 'Agente'>) {
  const { agente, reservas } = useFeatures();
  useIaLocal();
  const resolverReservaEnCola = useCallback(
    async (clave: string) => (await reservas.casos.obtenerReservaPorClave(clave))?.id ?? null,
    [reservas],
  );
  const estadoModelo = useEstadoModelo();
  return (
    <Marco titulo="Asistente de reservas" alMisReservas={() => navigation.navigate('MisReservas')}>
      <PantallaAgente
        casos={agente.casos}
        alPagar={(reservaId) => navigation.navigate('Reserva', { reservaId })}
        resolverReservaEnCola={resolverReservaEnCola}
        modoIa={estadoModelo === 'CARGADO' ? 'local' : 'basico'}
        alAbrirIa={() => navigation.navigate('ModeloIa')}
      />
    </Marco>
  );
}

/** Descargar, activar y borrar el modelo de IA local (core/ia lo hace; la pantalla solo muestra). */
function RutaModeloIa({ navigation }: NativeStackScreenProps<Rutas, 'ModeloIa'>) {
  const estado = useEstadoModelo();
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void modeloLocal.refrescar().catch(() => undefined);
  }, []);

  const mensaje = (e: unknown, porDefecto: string) => (e instanceof Error ? e.message : porDefecto);

  const descargar = async () => {
    setError(null);
    setProgreso(0);
    try {
      await modeloLocal.descargar(setProgreso);
    } catch (e) {
      setError(mensaje(e, 'No se pudo descargar el modelo.'));
    }
  };
  const activar = async () => {
    setError(null);
    try {
      await modeloLocal.cargar();
    } catch (e) {
      setError(
        `${mensaje(e, 'No se pudo activar el modelo.')} Si estás usando Expo Go, la IA local solo se puede activar en una versión instalada de la app (development build).`,
      );
    }
  };
  const eliminar = () =>
    Alert.alert('Borrar el modelo', 'Se libera el espacio y el asistente vuelve al modo básico. Podrás descargarlo de nuevo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          setError(null);
          modeloLocal.eliminar().catch((e) => setError(mensaje(e, 'No se pudo borrar el modelo.')));
        },
      },
    ]);

  return (
    <Marco titulo="IA local" alVolver={navigation.goBack}>
      <PantallaModeloIa
        estado={estado}
        progreso={progreso}
        tamanoMb={Math.round(MODELO_IA.tamanoBytes / 1_000_000)}
        error={error}
        alDescargar={() => void descargar()}
        alActivar={() => void activar()}
        alEliminar={eliminar}
      />
    </Marco>
  );
}

function RutaMisReservas({ navigation }: NativeStackScreenProps<Rutas, 'MisReservas'>) {
  const { reservas } = useFeatures();
  const { sesion } = useSesion();
  return (
    <Marco titulo="Mis reservas" alVolver={navigation.goBack}>
      {sesion ? (
        <PantallaMisReservas
          casos={reservas.casos}
          clienteId={sesion.usuarioId}
          alAbrir={(reservaId) => navigation.navigate('Reserva', { reservaId })}
        />
      ) : null}
    </Marco>
  );
}

function RutaReserva({ navigation, route }: NativeStackScreenProps<Rutas, 'Reserva'>) {
  const { reservas } = useFeatures();
  return (
    <Marco titulo="Detalle de reserva" alVolver={navigation.goBack}>
      <PantallaReserva
        casos={reservas.casos}
        reservaId={route.params.reservaId}
        pagoRecibido={route.params.pagoRecibido}
        alPagar={(r) =>
          navigation.navigate('Pago', {
            solicitud: {
              reservaId: r.id,
              anfitrionId: r.anfitrionId,
              subtotal: r.total,
              reservaBloqueadaHasta: r.bloqueadaHasta,
            },
          })
        }
      />
    </Marco>
  );
}

function RutaPago({ navigation, route }: NativeStackScreenProps<Rutas, 'Pago'>) {
  const { pagos } = useFeatures();
  return (
    <Marco titulo="Pago con QR" alVolver={navigation.goBack}>
      <PantallaPago
        casos={pagos.casos}
        solicitud={route.params.solicitud}
        alTerminar={(completado) =>
          completado
            ? // Vuelve a la reserva (sin apilar otra) avisando que el pago ya llegó.
              navigation.popTo('Reserva', { reservaId: route.params.solicitud.reservaId, pagoRecibido: true })
            : navigation.goBack()
        }
      />
    </Marco>
  );
}

const TEMA = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: COLOR.fondo, primary: COLOR.primario } };

export function NavegacionApp({ features }: { features: Features }) {
  return (
    <ContextoFeatures.Provider value={features}>
      <NavigationContainer theme={TEMA}>
        <Stack.Navigator initialRouteName="Agente" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Agente" component={RutaAgente} />
          <Stack.Screen name="MisReservas" component={RutaMisReservas} />
          <Stack.Screen name="ModeloIa" component={RutaModeloIa} />
          <Stack.Screen name="Reserva" component={RutaReserva} />
          <Stack.Screen name="Pago" component={RutaPago} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextoFeatures.Provider>
  );
}
