// ======================================================================
// ARCHIVO: ia/presentacion/pantallas/PantallaModeloIa.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla donde el usuario descarga, activa o borra el modelo de IA que corre en su celular.
// PARA QUÉ SIRVE: Sin descargar el modelo, el asistente entiende los mensajes con reglas simples ("modo básico").
// SIN ÉL: El usuario no tendría cómo usar la IA local.
// NO VA AQUÍ: La descarga ni la carga del modelo (es core/ia): solo avisa con alDescargar, alActivar y alEliminar.
// ======================================================================
// Honestidad: el modelo se puede DESCARGAR en Expo Go, pero ACTIVARLO exige una versión instalada
// de la app (development build). Si la activación falla, el mensaje de error lo explica.

import { Cpu, Download, HardDrive, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';

export type EstadoModeloIa = 'NO_SOPORTADO' | 'NO_DESCARGADO' | 'DESCARGANDO' | 'LISTO' | 'CARGADO' | 'ERROR';

interface Props {
  estado: EstadoModeloIa;
  /** Avance de la descarga, de 0 a 1. */
  progreso: number;
  tamanoMb: number;
  /** Mensaje del último intento fallido (descargar, activar o borrar). */
  error: string | null;
  alDescargar: () => void;
  alActivar: () => void;
  alEliminar: () => void;
}

const TEXTO: Record<EstadoModeloIa, { etiqueta: string; tono: Tono }> = {
  NO_SOPORTADO: { etiqueta: 'No disponible en este celular', tono: 'neutro' },
  NO_DESCARGADO: { etiqueta: 'No descargado', tono: 'aviso' },
  DESCARGANDO: { etiqueta: 'Descargando…', tono: 'primario' },
  LISTO: { etiqueta: 'Descargado', tono: 'primario' },
  CARGADO: { etiqueta: 'Activo', tono: 'exito' },
  ERROR: { etiqueta: 'Hubo un problema', tono: 'error' },
};

export function PantallaModeloIa({ estado, progreso, tamanoMb, error, alDescargar, alActivar, alEliminar }: Props) {
  const porcentaje = Math.round(progreso * 100);
  const descargadosMb = Math.round(progreso * tamanoMb);

  return (
    <ScrollView contentContainerStyle={estilos.pagina} style={{ backgroundColor: COLOR.fondo }}>
      <View style={estilos.tarjeta}>
        <View style={estilos.cabecera}>
          <View style={estilos.icono}>
            <Cpu color={COLOR.primario} size={26} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={estilos.titulo}>IA local en tu dispositivo</Text>
            <Insignia texto={TEXTO[estado].etiqueta} tono={TEXTO[estado].tono} />
          </View>
        </View>

        <Text style={estilos.texto}>
          Con el modelo descargado, el asistente entiende tus mensajes dentro del celular, sin enviarlos a ningún servidor.
          Sin él, usa reglas simples ("modo básico"): sigue funcionando, pero entiende menos frases.
        </Text>
        <Text style={estilos.suave}>
          Buscar alojamientos, reservar y pagar siempre necesitan conexión con los servicios de Aloja-Te.
        </Text>

        <View style={estilos.requisitos}>
          <View style={estilos.requisito}>
            <HardDrive color={COLOR.textoSuave} size={18} />
            <Text style={estilos.suave}>Descarga de unos {tamanoMb} MB (mejor con Wi-Fi)</Text>
          </View>
          <View style={estilos.requisito}>
            <Cpu color={COLOR.textoSuave} size={18} />
            <Text style={estilos.suave}>Celular con 4 GB de RAM o más</Text>
          </View>
        </View>
      </View>

      {estado === 'NO_SOPORTADO' && (
        <View style={[estilos.tarjeta, estilos.aviso]}>
          <Text style={estilos.avisoTexto}>
            Este celular no cumple los requisitos (RAM o espacio libre) o la IA local está desactivada. El asistente
            seguirá en modo básico.
          </Text>
        </View>
      )}

      {estado === 'DESCARGANDO' && (
        <View style={estilos.tarjeta}>
          <View style={estilos.filaProgreso}>
            <ActivityIndicator color={COLOR.primario} />
            <Text style={estilos.progresoTexto}>
              {porcentaje}% · {descargadosMb} de {tamanoMb} MB
            </Text>
          </View>
          <View
            style={estilos.barra}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: porcentaje }}
          >
            <View style={[estilos.barraRelleno, { width: `${porcentaje}%` }]} />
          </View>
          <Text style={estilos.suave}>Mantén la app abierta hasta que termine.</Text>
        </View>
      )}

      {error && (
        <View style={[estilos.tarjeta, estilos.fallo]} accessibilityRole="alert">
          <Text style={estilos.falloTexto}>{error}</Text>
        </View>
      )}

      {(estado === 'NO_DESCARGADO' || estado === 'ERROR') && (
        <Boton
          titulo={estado === 'ERROR' ? 'Reintentar descarga' : `Descargar modelo (${tamanoMb} MB)`}
          onPress={alDescargar}
          iconoIzquierda={(c) => <Download color={c} size={20} />}
        />
      )}

      {estado === 'LISTO' && (
        <>
          <Boton titulo="Activar ahora" onPress={alActivar} />
          <Text style={estilos.suave}>
            También se activa solo al abrir el asistente. Activarlo requiere la app instalada (development build), no
            Expo Go.
          </Text>
        </>
      )}

      {estado === 'CARGADO' && (
        <Text style={estilos.suave}>El asistente ya está usando la IA local. Se libera la memoria al salir de él.</Text>
      )}

      {(estado === 'LISTO' || estado === 'CARGADO') && (
        <Boton
          variante="contorno"
          titulo="Borrar modelo y liberar espacio"
          onPress={alEliminar}
          iconoIzquierda={(c) => <Trash2 color={c} size={18} />}
        />
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { padding: ESPACIO.l, gap: ESPACIO.l, paddingBottom: ESPACIO.xxl },
  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, borderWidth: 1, borderColor: COLOR.borde, padding: ESPACIO.l, gap: ESPACIO.m },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  icono: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto },
  texto: { fontFamily: FUENTE.normal, fontSize: 15, lineHeight: 22, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, lineHeight: 20, color: COLOR.textoSuave },
  requisitos: { gap: ESPACIO.s, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  aviso: { backgroundColor: COLOR.avisoFondo, borderColor: COLOR.avisoBorde },
  avisoTexto: { fontFamily: FUENTE.medio, fontSize: 14, lineHeight: 20, color: '#92400e' },
  filaProgreso: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  progresoTexto: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.texto },
  barra: { height: 8, borderRadius: 4, backgroundColor: COLOR.borde, overflow: 'hidden' },
  barraRelleno: { height: 8, borderRadius: 4, backgroundColor: COLOR.primario },
  fallo: { backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },
  falloTexto: { fontFamily: FUENTE.medio, fontSize: 14, lineHeight: 20, color: COLOR.error },
});
