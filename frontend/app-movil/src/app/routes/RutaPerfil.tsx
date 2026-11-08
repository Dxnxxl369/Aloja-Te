// ======================================================================
// ARCHIVO: app/routes/RutaPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de la pestaña "Perfil": le da a la pantalla los datos de la sesión y abre Mis reservas, el agente inteligente o cierra sesión.
// PARA QUÉ SIRVE: Que la pantalla no sepa de sesión ni de navegación.
// SIN ÉL: El perfil no podría cerrar la sesión ni abrir otras pantallas.
// NO VA AQUÍ: Dibujo (es PantallaPerfil) ni la sesión en sí (es core/auth).
// ======================================================================

import { Alert } from 'react-native';
import { useEstadoModelo, useSesion } from '../../core';
import { PantallaPerfil } from '../../features/cuenta';
import { Marco } from '../Marco';
import type { PropsTab } from '../routeTypes';

export function RutaPerfil({ navigation }: PropsTab<'Perfil'>) {
  const { sesion, cerrarSesion } = useSesion();
  const estadoModelo = useEstadoModelo();
  const confirmarSalida = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);
  return (
    <Marco titulo="Mi perfil">
      {sesion ? (
        <PantallaPerfil
          nombre={sesion.nombre}
          email={sesion.email}
          rol={sesion.rol}
          estadoIa={estadoModelo}
          alMisReservas={() => navigation.navigate('MisReservas')}
          alAbrirIa={() => navigation.navigate('ModeloIa')}
          alCerrarSesion={confirmarSalida}
        />
      ) : null}
    </Marco>
  );
}
