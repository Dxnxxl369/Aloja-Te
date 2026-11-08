// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La pestaña "Perfil": tu cuenta, el acceso a tus reservas, el agente inteligente y cerrar sesión.
// PARA QUÉ SIRVE: Un lugar fijo para la cuenta y para llegar a las reservas y al agente inteligente.
// SIN ÉL: La pestaña Perfil no existiría.
// NO VA AQUÍ: Cerrar la sesión ni descargar el agente inteligente: avisa con `alCerrarSesion` y `alAbrirIa`.
// ======================================================================
// Orden: TarjetaCuenta (quién eres) → sección "Mi actividad" → sección "Ajustes" → Cerrar sesión.
// Cada opción es una FilaPerfil dentro de una SeccionPerfil; para agregar una nueva basta con poner otra fila.

import { Bot, CalendarDays, LogOut } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { EstadoModelo } from '../../../../core';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { FilaPerfil } from '../componentes/FilaPerfil';
import { SeccionPerfil } from '../componentes/SeccionPerfil';
import { TarjetaCuenta } from '../componentes/TarjetaCuenta';

interface Props {
  nombre: string;
  email: string;
  rol: string;
  estadoIa: EstadoModelo;
  /** Abre la lista de reservas del usuario. */
  alMisReservas: () => void;
  alAbrirIa: () => void;
  alCerrarSesion: () => void;
}

/** Lo que dice la fila del agente inteligente según su estado (en palabras del usuario, sin términos técnicos). */
const TEXTO_IA: Record<EstadoModelo, string> = {
  CARGADO: 'Funcionando en tu celular',
  LISTO: 'Descargado: se activa al abrir el agente',
  DESCARGANDO: 'Descargando…',
  NO_DESCARGADO: 'Sin descargar: el agente entiende frases simples',
  NO_SOPORTADO: 'No disponible en este celular',
  ERROR: 'Hubo un problema: toca para revisar',
};

const TEXTO_ROL: Record<string, string> = { CLIENTE: 'Huésped', ANFITRION: 'Anfitrión', ADMINISTRADOR: 'Administrador' };

export function PantallaPerfil({ nombre, email, rol, estadoIa, alMisReservas, alAbrirIa, alCerrarSesion }: Props) {
  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      <TarjetaCuenta nombre={nombre} email={email} rol={TEXTO_ROL[rol] ?? rol} />

      <SeccionPerfil titulo="Mi actividad">
        <FilaPerfil Icono={CalendarDays} titulo="Mis reservas" subtitulo="Consulta, paga o revisa tus reservas" alPresionar={alMisReservas} />
      </SeccionPerfil>

      <SeccionPerfil titulo="Ajustes">
        <FilaPerfil Icono={Bot} titulo="Agente inteligente" subtitulo={TEXTO_IA[estadoIa]} alPresionar={alAbrirIa} />
      </SeccionPerfil>

      <View style={estilos.salir}>
        <Boton
          variante="contorno"
          titulo="Cerrar sesión"
          onPress={alCerrarSesion}
          iconoIzquierda={() => <LogOut color={COLOR.error} size={18} />}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.xl },
  salir: { marginTop: ESPACIO.s },
});
