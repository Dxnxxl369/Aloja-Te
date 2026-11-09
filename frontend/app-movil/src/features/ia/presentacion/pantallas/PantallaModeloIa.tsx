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
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR } from '../../../../shared/ui/tema';
import { TEXTO } from '../texts';
import type { EstadoModeloIa } from '../texts';
import { estilos } from './PantallaModeloIa.styles';

export type { EstadoModeloIa };

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
