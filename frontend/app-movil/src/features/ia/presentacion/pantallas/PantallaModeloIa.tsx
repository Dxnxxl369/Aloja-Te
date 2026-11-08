// ======================================================================
// ARCHIVO: ia/presentacion/pantallas/PantallaModeloIa.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla "Agente inteligente": donde el usuario descarga, activa o borra la inteligencia del agente que funciona en su celular.
// PARA QUÉ SIRVE: Sin descargarla, el agente sigue funcionando pero entiende menos frases.
// SIN ÉL: El usuario no tendría cómo mejorar al agente.
// NO VA AQUÍ: La descarga ni la carga (es core/ia): solo avisa con alDescargar, alActivar y alEliminar.
// ======================================================================
// Todos los textos están escritos para el usuario final: sin palabras técnicas (modelo, servidor, memoria RAM, versión de desarrollo).
// Los errores técnicos no se muestran aquí: los traduce app/navegacion.tsx a un mensaje claro.

import { Bot, Download, HardDrive, Smartphone, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import type { Tono } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

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
  NO_DESCARGADO: { etiqueta: 'Sin descargar', tono: 'aviso' },
  DESCARGANDO: { etiqueta: 'Descargando…', tono: 'primario' },
  LISTO: { etiqueta: 'Descargado', tono: 'primario' },
  CARGADO: { etiqueta: 'Funcionando', tono: 'exito' },
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
            <Bot color={COLOR.primario} size={26} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={estilos.titulo}>Agente inteligente</Text>
            <Insignia texto={TEXTO[estado].etiqueta} tono={TEXTO[estado].tono} />
          </View>
        </View>

        <Text style={estilos.texto}>
          Descárgalo una sola vez y el agente entenderá mejor lo que le escribes, aunque uses frases largas o distintas.
          Lo que escribes se queda en tu celular.
        </Text>
        <Text style={estilos.suave}>
          Si no lo descargas, el agente sigue funcionando, pero entiende menos frases. Para buscar, reservar y pagar siempre
          necesitas internet.
        </Text>

        <View style={estilos.requisitos}>
          <View style={estilos.requisito}>
            <HardDrive color={COLOR.textoSuave} size={18} />
            <Text style={estilos.requisitoTexto}>Ocupa unos {tamanoMb} MB. Conviene descargarlo con Wi-Fi.</Text>
          </View>
          <View style={estilos.requisito}>
            <Smartphone color={COLOR.textoSuave} size={18} />
            <Text style={estilos.requisitoTexto}>Funciona mejor en celulares con 4 GB de memoria o más.</Text>
          </View>
        </View>
      </View>

      {estado === 'NO_SOPORTADO' && (
        <View style={[estilos.tarjeta, estilos.aviso]}>
          <Text style={estilos.avisoTexto}>
            Este celular no tiene suficiente memoria o espacio libre para el agente inteligente. No pasa nada: el agente
            seguirá funcionando con frases simples.
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

      {error ? (
        <View style={[estilos.tarjeta, estilos.fallo]} accessibilityRole="alert">
          <Text style={estilos.falloTexto}>{error}</Text>
        </View>
      ) : null}

      {(estado === 'NO_DESCARGADO' || estado === 'ERROR') && (
        <Boton
          titulo={estado === 'ERROR' ? 'Reintentar descarga' : 'Descargar ahora'}
          onPress={alDescargar}
          iconoIzquierda={(c) => <Download color={c} size={20} />}
        />
      )}

      {estado === 'LISTO' && (
        <>
          <Boton titulo="Activar ahora" onPress={alActivar} />
          <Text style={estilos.suave}>Ya está descargado. También se activa solo cada vez que abres el agente.</Text>
        </>
      )}

      {estado === 'CARGADO' && (
        <Text style={estilos.suave}>El agente ya está usando la inteligencia de tu celular. Se libera al salir del agente.</Text>
      )}

      {(estado === 'LISTO' || estado === 'CARGADO') && (
        <Boton
          variante="contorno"
          titulo="Borrar y liberar espacio"
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
  titulo: { ...FUENTE.titulo, fontSize: TAMANO.titulo, color: COLOR.texto },
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.texto },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.textoSuave },
  requisitos: { gap: ESPACIO.s, backgroundColor: COLOR.campo, borderRadius: RADIO.control, padding: ESPACIO.m },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  requisitoTexto: { flex: 1, ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.textoSuave },
  aviso: { backgroundColor: COLOR.avisoFondo, borderColor: COLOR.avisoBorde },
  avisoTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, lineHeight: 19, color: '#92400e' },
  filaProgreso: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  progresoTexto: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  barra: { height: 8, borderRadius: 4, backgroundColor: COLOR.borde, overflow: 'hidden' },
  barraRelleno: { height: 8, borderRadius: 4, backgroundColor: COLOR.primario },
  fallo: { backgroundColor: COLOR.errorFondo, borderColor: COLOR.errorBorde },
  falloTexto: { ...FUENTE.medio, fontSize: TAMANO.secundario, lineHeight: 19, color: COLOR.errorOscuro },
});
