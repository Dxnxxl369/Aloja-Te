// ======================================================================
// ARCHIVO: agente/presentacion/pantallas/PantallaAgente.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La pantalla del agente: chat, plan visible, opciones para tocar y botones de confirmar o pagar.
// PARA QUÉ SIRVE: Es donde el usuario genera la reserva hablando; al terminar entrega el `reservaId` para el pago.
// SIN ÉL: No habría interfaz para el agente.
// NO VA AQUÍ: Reglas del plan ni llamadas HTTP.
// ======================================================================
// Diseño: mockups "2. Agente: conversación y plan" y "3. Agente: elegir alojamiento".
// Las insignias de las opciones ("Económico", "Espacioso") se calculan con los datos reales
// de las opciones: no hay calificaciones en el modelo, así que no se muestra "Top valorado".

import { Bot, ChevronDown, ChevronUp, ClipboardList, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { CasosAgente } from '../../domain/interfaces';
import type { Mensaje, Opcion } from '../../domain/modelos';
import { PanelPlan, pasoActual } from '../componentes/PanelPlan';
import { useAgente } from '../useAgente';

interface Props {
  casos: CasosAgente;
  /** El agente termina aquí: el pago es otra pantalla, sin agente. */
  alPagar: (reservaId: string) => void;
  /**
   * Cuando la reserva quedó en la cola offline, busca su id real una vez que se envió.
   * Devuelve null mientras siga pendiente. Lo conecta app/ con el feature reservas.
   */
  resolverReservaEnCola?: (claveCola: string) => Promise<string | null>;
}

const POLL_COLA_MS = 3_000;

/** Misma forma que `descripcionOpcion` (domain/plan.ts): sirve para no repetir la lista que ya se dibuja como tarjetas. */
const LINEA_OPCION = /^\d+\. .+ · hasta \d+ personas · Bs \d+(\.\d+)? por noche$/;

function quitarListaDeOpciones(texto: string): string {
  return texto
    .split('\n')
    .filter((l) => !LINEA_OPCION.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatearHora(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Recuerda a qué hora apareció cada mensaje (el modelo del agente no guarda la hora). */
function useHoras(mensajes: Mensaje[]): Map<number, number> {
  const horas = useRef(new Map<number, number>());
  if (mensajes.length <= 1) horas.current.clear(); // conversación nueva
  for (const m of mensajes) if (!horas.current.has(m.id)) horas.current.set(m.id, Date.now());
  return horas.current;
}

function insigniaDe(o: Opcion, todas: Opcion[]): string | null {
  if (todas.length < 2) return null;
  const masBarata = Math.min(...todas.map((x) => x.precioNoche));
  const mayorCapacidad = Math.max(...todas.map((x) => x.capacidad));
  const menorCapacidad = Math.min(...todas.map((x) => x.capacidad));
  if (o.precioNoche === masBarata) return 'Económico';
  if (o.capacidad === mayorCapacidad && mayorCapacidad > menorCapacidad) return 'Espacioso';
  return null;
}

export function PantallaAgente({ casos, alPagar, resolverReservaEnCola }: Props) {
  const { estado, ocupado, enviar, elegir, confirmar, rechazar, reiniciar } = useAgente(casos);
  const [texto, setTexto] = useState('');
  const [verPlan, setVerPlan] = useState(true);
  const [reservaDeCola, setReservaDeCola] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const horas = useHoras(estado.mensajes);
  const terminada = estado.fase === 'RESERVADO' || estado.fase === 'EN_COLA' || estado.fase === 'TERMINADO';

  // Reserva guardada sin internet: cuando la cola la envía, se habilita el botón de pagar.
  useEffect(() => {
    setReservaDeCola(null);
    if (estado.fase !== 'EN_COLA' || !estado.claveCola || !resolverReservaEnCola) return;
    const clave = estado.claveCola;
    let vivo = true;
    const preguntar = async () => {
      try {
        const id = await resolverReservaEnCola(clave);
        if (vivo && id) setReservaDeCola(id);
      } catch {
        /* se vuelve a intentar en el siguiente ciclo */
      }
    };
    void preguntar();
    const t = setInterval(() => void preguntar(), POLL_COLA_MS);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [estado.fase, estado.claveCola, resolverReservaEnCola]);

  const mandar = () => {
    const t = texto.trim();
    if (!t || ocupado) return;
    setTexto('');
    void enviar(t);
  };

  const ultimoDelAgente = [...estado.mensajes].reverse().find((m) => m.rol === 'agente')?.id;

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={verPlan ? 'Ocultar plan' : 'Ver plan del agente'}
          onPress={() => setVerPlan((v) => !v)}
          style={estilos.alternarPlan}
        >
          {!verPlan && <ClipboardList color={COLOR.primario} size={20} />}
          <Text style={estilos.alternarTexto}>{verPlan ? 'Ocultar plan' : 'Ver plan del agente'}</Text>
          {!verPlan && <Text style={estilos.alternarPaso}>Paso {pasoActual(estado.plan)} de {estado.plan.length}</Text>}
          {verPlan ? <ChevronUp color={COLOR.primario} size={20} /> : <ChevronDown color={COLOR.primario} size={20} />}
        </Pressable>
        {verPlan && <PanelPlan plan={estado.plan} />}

        <View style={estilos.dia}>
          <Insignia texto="Hoy · Asistencia en tiempo real" />
        </View>

        {estado.mensajes.map((m) => {
          const esUsuario = m.rol === 'usuario';
          const mostrar =
            !esUsuario && estado.fase === 'ELIGIENDO' && m.id === ultimoDelAgente ? quitarListaDeOpciones(m.texto) : m.texto;
          return (
            <View key={m.id} style={[estilos.filaMensaje, esUsuario && { justifyContent: 'flex-end' }]}>
              {!esUsuario && <Avatar />}
              <View style={{ maxWidth: '82%', alignItems: esUsuario ? 'flex-end' : 'flex-start' }}>
                <View style={[estilos.burbuja, esUsuario ? estilos.usuario : estilos.agente]}>
                  <Text style={esUsuario ? estilos.textoUsuario : estilos.textoAgente}>{mostrar}</Text>
                </View>
                <Text style={estilos.hora}>{formatearHora(horas.get(m.id) ?? Date.now())}</Text>
              </View>
            </View>
          );
        })}

        {ocupado && (
          <View style={estilos.filaMensaje}>
            <Avatar />
            <View style={[estilos.burbuja, estilos.agente, estilos.escribiendo]}>
              <Text style={estilos.textoAgente}>Trabajando en tu pedido</Text>
              <ActivityIndicator size="small" color={COLOR.primario} />
            </View>
          </View>
        )}

        {estado.fase === 'ELIGIENDO' &&
          estado.opciones.map((o, i) => {
            const insignia = insigniaDe(o, estado.opciones);
            return (
              <View key={o.unidadId} style={estilos.opcion}>
                <View style={estilos.opcionCabecera}>
                  <Text style={estilos.opcionTitulo} numberOfLines={2}>
                    {i + 1}. {o.titulo}
                  </Text>
                  {insignia && <Insignia texto={insignia} />}
                </View>
                <Text style={estilos.opcionDetalle}>
                  {o.unidadNombre} ({o.ciudad}) · hasta {o.capacidad} personas
                </Text>
                <Text style={estilos.precio}>
                  Bs {o.precioNoche.toFixed(2)} <Text style={estilos.porNoche}>por noche</Text>
                </Text>
                <Boton
                  titulo={`Elegir ${i + 1}`}
                  onPress={() => void elegir(i)}
                  deshabilitado={ocupado}
                  iconoDerecha={() => <Text style={estilos.flecha}>→</Text>}
                />
              </View>
            );
          })}

        {estado.fase === 'CONFIRMANDO' && (
          <View style={estilos.fila}>
            <View style={{ flex: 1 }}>
              <Boton titulo="Sí, reservar" onPress={() => void confirmar()} cargando={ocupado} />
            </View>
            <View style={{ flex: 1 }}>
              <Boton variante="contorno" titulo="No" onPress={() => void rechazar()} deshabilitado={ocupado} />
            </View>
          </View>
        )}

        {estado.fase === 'RESERVADO' && estado.reservaId && (
          <Boton titulo="Pagar ahora" onPress={() => alPagar(estado.reservaId as string)} />
        )}
        {estado.fase === 'EN_COLA' && reservaDeCola && (
          <Boton titulo="Ver reserva y pagar" onPress={() => alPagar(reservaDeCola)} />
        )}
        {terminada && <Boton variante="contorno" titulo="Nueva reserva" onPress={reiniciar} />}
      </ScrollView>

      {!terminada && (
        <View style={[estilos.pie, { paddingBottom: insets.bottom }]}>
          {estado.fase === 'ELIGIENDO' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips} keyboardShouldPersistTaps="handled">
              {estado.opciones.map((o, i) => (
                <Pressable
                  key={o.unidadId}
                  accessibilityRole="button"
                  accessibilityLabel={`Opción ${i + 1}`}
                  disabled={ocupado}
                  onPress={() => void elegir(i)}
                  style={estilos.chip}
                >
                  <Text style={estilos.chipTexto}>Opción {i + 1}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={estilos.entrada}>
            <TextInput
              style={estilos.input}
              value={texto}
              onChangeText={setTexto}
              placeholder="Ej: 2 personas en Cochabamba del 12 al 15 de diciembre"
              placeholderTextColor={COLOR.textoSuave}
              editable={!ocupado}
              onSubmitEditing={mandar}
              returnKeyType="send"
            />
            <Boton
              titulo="Enviar"
              onPress={mandar}
              cargando={ocupado}
              deshabilitado={!texto.trim()}
              iconoDerecha={(c) => <Send color={c} size={18} />}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function Avatar() {
  return (
    <View style={estilos.avatar}>
      <Bot color={COLOR.primario} size={18} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  contenido: { padding: ESPACIO.l, gap: ESPACIO.m },

  alternarPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACIO.s,
    minHeight: 48,
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  alternarTexto: { fontFamily: FUENTE.semi, fontSize: 15, color: COLOR.primario },
  alternarPaso: { fontFamily: FUENTE.semi, fontSize: 11, color: COLOR.primario, letterSpacing: 0.4 },
  dia: { alignItems: 'center' },

  filaMensaje: { flexDirection: 'row', alignItems: 'flex-end', gap: ESPACIO.s },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  burbuja: { paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.m, borderRadius: RADIO.tarjeta },
  usuario: { backgroundColor: COLOR.primario, borderBottomRightRadius: 4 },
  agente: { backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde, borderBottomLeftRadius: 4 },
  escribiendo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  textoUsuario: { fontFamily: FUENTE.normal, fontSize: 15, lineHeight: 22, color: '#fff' },
  textoAgente: { fontFamily: FUENTE.normal, fontSize: 15, lineHeight: 22, color: COLOR.texto },
  hora: { fontFamily: FUENTE.normal, fontSize: 11, color: COLOR.textoSuave, marginTop: 4 },

  opcion: { backgroundColor: COLOR.tarjeta, borderRadius: RADIO.tarjeta, padding: ESPACIO.l, gap: ESPACIO.s, borderWidth: 1, borderColor: COLOR.borde },
  opcionCabecera: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: ESPACIO.s },
  opcionTitulo: { flex: 1, fontFamily: FUENTE.titulo, fontSize: 18, color: COLOR.texto },
  opcionDetalle: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  precio: { fontFamily: FUENTE.fuerte, fontSize: 20, color: COLOR.texto, marginVertical: ESPACIO.xs },
  porNoche: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  flecha: { color: '#fff', fontSize: 18 },

  fila: { flexDirection: 'row', gap: ESPACIO.s },

  pie: { backgroundColor: COLOR.fondo, borderTopWidth: 1, borderTopColor: COLOR.borde },
  chips: { gap: ESPACIO.s, paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.m },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: RADIO.pildora, borderWidth: 1, borderColor: COLOR.borde, backgroundColor: COLOR.tarjeta, justifyContent: 'center' },
  chipTexto: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.textoSuave },
  entrada: { flexDirection: 'row', gap: ESPACIO.s, padding: ESPACIO.l, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.control,
    paddingHorizontal: ESPACIO.l,
    backgroundColor: COLOR.tarjeta,
    fontFamily: FUENTE.normal,
    fontSize: 14,
    color: COLOR.texto,
  },
});
