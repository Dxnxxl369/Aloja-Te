// ======================================================================
// ARCHIVO: App.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La raíz de la app: carga las fuentes, arranca core y los features, y decide entre login y la app.
// PARA QUÉ SIRVE: Es lo primero que corre. Sin sesión se muestra el login; con sesión, Agente -> Reserva -> Pago.
// SIN ÉL: Nada arranca.
// NO VA AQUÍ: Reglas de negocio ni diseño de pantallas.
// ======================================================================

// Se importa cada peso por separado: el índice del paquete empaquetaría las ~40 fuentes.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { crearFeatures } from './src/app/features';
import type { Features } from './src/app/features';
import { mensajeDeLogin } from './src/app/mensajes';
import { NavegacionApp } from './src/app/navegacion';
import { auth, iniciarCore, SesionProvider, useSesion } from './src/core';
import { PantallaLogin } from './src/features/cuenta';
import { COLOR, ESPACIO, FUENTE } from './src/shared/ui/tema';

// Se arranca una sola vez aunque React vuelva a montar el componente.
// ORDEN: primero los features (registran sus manejadores de la cola offline), después core
// (abre SQLite y empieza a enviar lo pendiente). Ver app/features.ts.
let arranque: Promise<Features> | null = null;
function iniciarApp(): Promise<Features> {
  arranque ??= (async () => {
    const features = crearFeatures();
    await iniciarCore();
    return features;
  })();
  return arranque;
}

export default function App() {
  const [fuentesListas, errorFuentes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const [features, setFeatures] = useState<Features | null>(null);
  const [errorInicio, setErrorInicio] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    iniciarApp().then(
      (f) => vivo && setFeatures(f),
      (e: unknown) => {
        arranque = null; // permite reintentar al reabrir la app
        if (vivo) setErrorInicio(e instanceof Error ? e.message : 'No se pudo iniciar la app.');
      },
    );
    return () => {
      vivo = false;
    };
  }, []);

  // Si las fuentes fallan, la app sigue con la tipografía del sistema.
  const listoParaMostrar = (fuentesListas || errorFuentes !== null) && features !== null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {errorInicio ? (
        <Centro>
          <Text style={estilos.error}>{errorInicio}</Text>
        </Centro>
      ) : !listoParaMostrar ? (
        <Centro>
          <ActivityIndicator color={COLOR.primario} size="large" />
        </Centro>
      ) : (
        <SesionProvider auth={auth}>
          <Raiz features={features} />
        </SesionProvider>
      )}
    </SafeAreaProvider>
  );
}

/** Login si no hay sesión; la app si la hay. También vuelve al login cuando la sesión vence (401). */
function Raiz({ features }: { features: Features }) {
  const { sesion, cargando, iniciarSesion } = useSesion();

  if (cargando) {
    return (
      <Centro>
        <ActivityIndicator color={COLOR.primario} size="large" />
      </Centro>
    );
  }
  if (!sesion) {
    return (
      <PantallaLogin
        alIniciar={async (email, password) => {
          try {
            await iniciarSesion(email, password);
          } catch (e) {
            throw new Error(mensajeDeLogin(e));
          }
        }}
      />
    );
  }
  return <NavegacionApp features={features} />;
}

function Centro({ children }: { children: React.ReactNode }) {
  return <View style={estilos.centro}>{children}</View>;
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACIO.xl, backgroundColor: COLOR.fondo },
  error: { fontFamily: FUENTE.medio, fontSize: 15, color: COLOR.error, textAlign: 'center' },
});
