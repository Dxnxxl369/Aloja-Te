// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La pestaña "Perfil": quién eres, el estado de la IA local y cerrar sesión.
// PARA QUÉ SIRVE: Un lugar fijo para la cuenta (antes solo había un aviso emergente) y para llegar a la IA local.
// SIN ÉL: La pestaña Perfil no existiría.
// NO VA AQUÍ: Cerrar la sesión ni descargar el modelo: avisa con `alCerrarSesion` y `alAbrirIa`.
// ======================================================================
// No hay mockup de esta pantalla: usa los mismos componentes y colores del resto de la app.

import { Bot, ChevronRight, LogOut } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { EstadoModelo } from '../../../../core';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';

interface Props {
  nombre: string;
  email: string;
  rol: string;
  estadoIa: EstadoModelo;
  alAbrirIa: () => void;
  alCerrarSesion: () => void;
}

const TEXTO_IA: Record<EstadoModelo, string> = {
  CARGADO: 'Activa en este celular',
  LISTO: 'Descargada: se activa al abrir el asistente',
  DESCARGANDO: 'Descargando…',
  NO_DESCARGADO: 'No descargada: el asistente usa el modo básico',
  NO_SOPORTADO: 'Este celular no puede usarla',
  ERROR: 'Hubo un problema: toca para revisar',
};

const TEXTO_ROL: Record<string, string> = { CLIENTE: 'Huésped', ANFITRION: 'Anfitrión', ADMINISTRADOR: 'Administrador' };

export function PantallaPerfil({ nombre, email, rol, estadoIa, alAbrirIa, alCerrarSesion }: Props) {
  const inicial = (nombre.trim()[0] ?? email.trim()[0] ?? '?').toUpperCase();
  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      <View style={estilos.tarjeta}>
        <View style={estilos.avatar}>
          <Text style={estilos.inicial}>{inicial}</Text>
        </View>
        <Text style={estilos.nombre}>{nombre || 'Mi cuenta'}</Text>
        <Text style={estilos.suave}>{email}</Text>
        <Insignia texto={TEXTO_ROL[rol] ?? rol} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Asistente de IA local. ${TEXTO_IA[estadoIa]}`}
        onPress={alAbrirIa}
        style={({ pressed }) => [estilos.fila, pressed && { backgroundColor: COLOR.fondo }]}
      >
        <View style={estilos.icono}>
          <Bot color={COLOR.primario} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.filaTitulo}>Asistente de IA local</Text>
          <Text style={estilos.suave}>{TEXTO_IA[estadoIa]}</Text>
        </View>
        <ChevronRight color={COLOR.textoSuave} size={20} />
      </Pressable>

      <Boton
        variante="contorno"
        titulo="Cerrar sesión"
        onPress={alCerrarSesion}
        iconoIzquierda={() => <LogOut color={COLOR.error} size={18} />}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l },
  tarjeta: { alignItems: 'center', gap: ESPACIO.s, padding: ESPACIO.xl, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  inicial: { fontFamily: FUENTE.tituloFuerte, fontSize: 32, color: '#fff' },
  nombre: { fontFamily: FUENTE.tituloFuerte, fontSize: 24, color: COLOR.texto, textAlign: 'center' },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  icono: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  filaTitulo: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.texto },
});
