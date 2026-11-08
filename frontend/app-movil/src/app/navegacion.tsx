// ======================================================================
// ARCHIVO: app/navegacion.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Las pantallas de la sesión iniciada y cómo se pasa de una a otra: cuatro pestañas (Explorar, Reservas, Asistente, Perfil) y, encima, Detalle -> Reserva -> Pago.
// PARA QUÉ SIRVE: Conecta los features sin que se conozcan entre sí: aquí se arma la solicitud de pago a partir de la reserva.
// SIN ÉL: Cada feature tendría que importar al otro para navegar.
// NO VA AQUÍ: Reglas de negocio (están en cada feature) ni el login (es App.tsx).
// ======================================================================
// Cada pantalla va dentro de un <Marco>: cabecera + franja de "sin internet / pendientes".
// Las pantallas son componentes de módulo (no funciones en línea) para que React Navigation
// no las vuelva a montar en cada render y la conversación del agente no se pierda.
// Las pestañas se mantienen montadas: el chat del asistente conserva su conversación al cambiar de pestaña.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, View } from 'react-native';
import { MODELO_IA, modeloLocal, useEstadoModelo, useEstadoSync, useSesion } from '../core';
import { PantallaAgente } from '../features/agente';
import type { ContextoAlojamiento } from '../features/agente';
import { PantallaDetalle, PantallaExplorar, useDetalle } from '../features/catalogo';
import { PantallaPerfil } from '../features/cuenta';
import { PantallaModeloIa } from '../features/ia';
import { PantallaPago } from '../features/pagos';
import type { SolicitudPago } from '../features/pagos';
import { PantallaMisReservas, PantallaReserva, PantallaReservaManual } from '../features/reservas';
import { AvisoSinRed } from '../shared/ui/AvisoSinRed';
import { Boton } from '../shared/ui/Boton';
import { Encabezado } from '../shared/ui/Encabezado';
import type { DatosTarjetaAlojamiento } from '../shared/ui/TarjetaAlojamiento';
import { COLOR } from '../shared/ui/tema';
import { BarraTabs } from './BarraTabs';
import type { Features } from './features';

type RutasTabs = {
  Explorar: undefined;
  MisReservas: undefined;
  /** `alojamiento`: llegó desde la ficha de un alojamiento; `inicio` distingue cada llegada (reinicia la conversación). */
  Agente: { alojamiento?: ContextoAlojamiento; inicio?: number } | undefined;
  Perfil: undefined;
};

type RutasRaiz = {
  Tabs: NavigatorScreenParams<RutasTabs> | undefined;
  Detalle: { datos: DatosTarjetaAlojamiento };
  ReservaManual: { alojamientoId: string; titulo: string };
  ModeloIa: undefined;
  Reserva: { reservaId: string; pagoRecibido?: boolean };
  Pago: { solicitud: SolicitudPago };
};

/** Pantalla de una pestaña: puede navegar a las otras pestañas y a las pantallas de encima. */
type PropsTab<R extends keyof RutasTabs> = CompositeScreenProps<
  BottomTabScreenProps<RutasTabs, R>,
  NativeStackScreenProps<RutasRaiz>
>;
type PropsRaiz<R extends keyof RutasRaiz> = NativeStackScreenProps<RutasRaiz, R>;

const Stack = createNativeStackNavigator<RutasRaiz>();
const Tab = createBottomTabNavigator<RutasTabs>();
const ContextoFeatures = createContext<Features | null>(null);

function useFeatures(): Features {
  const f = useContext(ContextoFeatures);
  if (!f) throw new Error('useFeatures debe usarse dentro de <NavegacionApp>');
  return f;
}

/** Cabecera + aviso de conexión + el contenido de la pantalla. */
function Marco({
  titulo,
  marca,
  alVolver,
  alPerfil,
  alCompartir,
  children,
}: {
  titulo?: string;
  marca?: boolean;
  alVolver?: () => void;
  alPerfil: () => void;
  alCompartir?: () => void;
  children: ReactNode;
}) {
  const sync = useEstadoSync();
  return (
    <View style={{ flex: 1, backgroundColor: COLOR.fondo }}>
      <Encabezado titulo={titulo} marca={marca} alVolver={alVolver} alPerfil={alPerfil} alCompartir={alCompartir} />
      <AvisoSinRed conectado={sync.conectado} pendientes={sync.pendientes} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/**
 * IA local: se carga al abrir la pestaña del asistente (si el celular la soporta y está descargada) y se libera
 * al salir de ella, para no gastar memoria mientras se explora.
 */
function useIaLocal() {
  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );
}

/** Lo que el asistente necesita saber del alojamiento elegido. `inicio` hace que cada llegada empiece una conversación nueva. */
function paramsAsistente(datos: DatosTarjetaAlojamiento): RutasTabs['Agente'] {
  return { alojamiento: { id: datos.id, titulo: datos.titulo, ciudad: datos.ciudad ?? '' }, inicio: Date.now() };
}

function RutaExplorar({ navigation }: PropsTab<'Explorar'>) {
  const { catalogo } = useFeatures();
  const estadoModelo = useEstadoModelo();
  return (
    <Marco marca alPerfil={() => navigation.navigate('Perfil')}>
      <PantallaExplorar
        casos={catalogo.casos}
        alVer={(datos) => navigation.navigate('Detalle', { datos })}
        alReservarManual={(datos) => navigation.navigate('ReservaManual', { alojamientoId: datos.id, titulo: datos.titulo })}
        alReservarConAsistente={(datos) => navigation.navigate('Agente', paramsAsistente(datos))}
        alAbrirAsistente={() => navigation.navigate('Agente')}
        iaLista={estadoModelo === 'CARGADO'}
      />
    </Marco>
  );
}

function RutaAgente({ navigation, route }: PropsTab<'Agente'>) {
  const { agente, reservas } = useFeatures();
  useIaLocal();
  const resolverReservaEnCola = useCallback(
    async (clave: string) => (await reservas.casos.obtenerReservaPorClave(clave))?.id ?? null,
    [reservas],
  );
  const estadoModelo = useEstadoModelo();
  return (
    <Marco titulo="Asistente de reservas" alPerfil={() => navigation.navigate('Perfil')}>
      <PantallaAgente
        casos={agente.casos}
        alPagar={(reservaId) => navigation.navigate('Reserva', { reservaId })}
        resolverReservaEnCola={resolverReservaEnCola}
        modoIa={estadoModelo === 'CARGADO' ? 'local' : 'basico'}
        alAbrirIa={() => navigation.navigate('ModeloIa')}
        contexto={route.params?.alojamiento}
        claveContexto={route.params?.inicio}
      />
    </Marco>
  );
}

function RutaMisReservas({ navigation }: PropsTab<'MisReservas'>) {
  const { reservas } = useFeatures();
  const { sesion } = useSesion();
  return (
    <Marco titulo="Mis reservas" alPerfil={() => navigation.navigate('Perfil')}>
      {sesion ? (
        <PantallaMisReservas
          casos={reservas.casos}
          clienteId={sesion.usuarioId}
          alAbrir={(reservaId) => navigation.navigate('Reserva', { reservaId })}
          alExplorar={() => navigation.navigate('Explorar')}
        />
      ) : null}
    </Marco>
  );
}

function RutaPerfil({ navigation }: PropsTab<'Perfil'>) {
  const { sesion, cerrarSesion } = useSesion();
  const estadoModelo = useEstadoModelo();
  const confirmarSalida = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);
  return (
    <Marco titulo="Mi perfil" alPerfil={() => undefined}>
      {sesion ? (
        <PantallaPerfil
          nombre={sesion.nombre}
          email={sesion.email}
          rol={sesion.rol}
          estadoIa={estadoModelo}
          alAbrirIa={() => navigation.navigate('ModeloIa')}
          alCerrarSesion={confirmarSalida}
        />
      ) : null}
    </Marco>
  );
}

/** Las cuatro pestañas. Cada una se queda montada al cambiar de pestaña. */
function Pestanas() {
  return (
    <Tab.Navigator
      initialRouteName="Explorar"
      tabBar={(props) => <BarraTabs {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Explorar" component={RutaExplorar} />
      <Tab.Screen name="MisReservas" component={RutaMisReservas} />
      <Tab.Screen name="Agente" component={RutaAgente} />
      <Tab.Screen name="Perfil" component={RutaPerfil} />
    </Tab.Navigator>
  );
}

/** Todas las pantallas de encima de las pestañas llevan al perfil de la misma forma. */
const irAPerfil = (navigation: PropsRaiz<keyof RutasRaiz>['navigation']) => () =>
  navigation.navigate('Tabs', { screen: 'Perfil' });

function RutaDetalle({ navigation, route }: PropsRaiz<'Detalle'>) {
  const { catalogo } = useFeatures();
  const estadoModelo = useEstadoModelo();
  const { datos } = route.params;
  const irAlAsistente = () => navigation.navigate('Tabs', { screen: 'Agente', params: paramsAsistente(datos) });
  const compartir = () => {
    const lugar = [datos.ciudad, datos.departamento].filter(Boolean).join(', ');
    const precio = typeof datos.precioNoche === 'number' ? ` desde Bs ${datos.precioNoche} por noche` : '';
    void Share.share({ message: `${datos.titulo}${lugar ? ` en ${lugar}` : ''}${precio}. Míralo en Aloja-Te.` }).catch(() => undefined);
  };
  return (
    <Marco titulo="Detalle del alojamiento" alVolver={navigation.goBack} alPerfil={irAPerfil(navigation)} alCompartir={compartir}>
      <PantallaDetalle
        casos={catalogo.casos}
        datos={datos}
        iaLista={estadoModelo === 'CARGADO'}
        alReservarManual={() => navigation.navigate('ReservaManual', { alojamientoId: datos.id, titulo: datos.titulo })}
        alAsistente={irAlAsistente}
      />
    </Marco>
  );
}

/** Reservar a mano: carga las habitaciones del alojamiento y entrega la pantalla con sesión y reglas de reservas. */
function RutaReservaManual({ navigation, route }: PropsRaiz<'ReservaManual'>) {
  const { catalogo, reservas } = useFeatures();
  const { sesion } = useSesion();
  const { alojamientoId, titulo } = route.params;
  const { detalle, cargando, error, recargar } = useDetalle(catalogo.casos, alojamientoId);

  return (
    <Marco titulo="Reservar" alVolver={navigation.goBack} alPerfil={irAPerfil(navigation)}>
      {detalle && sesion ? (
        <PantallaReservaManual
          casos={reservas.casos}
          alojamiento={{
            alojamientoId: detalle.id,
            anfitrionId: detalle.anfitrionId,
            titulo: detalle.titulo,
            unidades: detalle.unidades,
          }}
          cliente={{ id: sesion.usuarioId, nombre: sesion.nombre }}
          // "replace": al volver atrás no se regresa a un formulario ya usado, sino a la ficha.
          alCreada={(reservaId) => navigation.replace('Reserva', { reservaId })}
          alQuedoEnCola={() => navigation.navigate('Tabs', { screen: 'MisReservas' })}
        />
      ) : (
        <View style={estilosRuta.centro}>
          {error ? (
            <>
              <Text accessibilityRole="alert" style={estilosRuta.error}>
                No se pudieron cargar las habitaciones de {titulo}: {error}
              </Text>
              <Boton titulo="Reintentar" onPress={recargar} />
            </>
          ) : cargando ? (
            <ActivityIndicator color={COLOR.primario} size="large" />
          ) : null}
        </View>
      )}
    </Marco>
  );
}

const estilosRuta = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  error: { fontSize: 14, color: COLOR.error, textAlign: 'center' },
});

/** Descargar, activar y borrar el modelo de IA local (core/ia lo hace; la pantalla solo muestra). */
function RutaModeloIa({ navigation }: PropsRaiz<'ModeloIa'>) {
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
    <Marco titulo="IA local" alVolver={navigation.goBack} alPerfil={irAPerfil(navigation)}>
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

function RutaReserva({ navigation, route }: PropsRaiz<'Reserva'>) {
  const { reservas, fichaAlojamiento } = useFeatures();
  return (
    <Marco titulo="Detalle de reserva" alVolver={navigation.goBack} alPerfil={irAPerfil(navigation)}>
      <PantallaReserva
        casos={reservas.casos}
        cargarFicha={fichaAlojamiento}
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

function RutaPago({ navigation, route }: PropsRaiz<'Pago'>) {
  const { pagos } = useFeatures();
  return (
    <Marco titulo="Pago con QR" alVolver={navigation.goBack} alPerfil={irAPerfil(navigation)}>
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
        <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={Pestanas} />
          <Stack.Screen name="Detalle" component={RutaDetalle} />
          <Stack.Screen name="ReservaManual" component={RutaReservaManual} />
          <Stack.Screen name="ModeloIa" component={RutaModeloIa} />
          <Stack.Screen name="Reserva" component={RutaReserva} />
          <Stack.Screen name="Pago" component={RutaPago} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextoFeatures.Provider>
  );
}
