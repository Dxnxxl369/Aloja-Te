// ======================================================================
// ARCHIVO: agente/presentacion/pantallas/PantallaAgente.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La pantalla del agente: cabecera fija con el avance en puntos, chat, tarjetas de alojamientos, respuestas rápidas y botones de confirmar o pagar.
// PARA QUÉ SIRVE: Es donde el usuario genera la reserva hablando; al terminar entrega el `reservaId` para el pago.
// SIN ÉL: No habría interfaz para el agente.
// NO VA AQUÍ: Reglas del plan ni llamadas HTTP.
// ======================================================================
// La conversación es el centro: el plan va en una cabecera fija de cuatro puntos y las respuestas rápidas
// salen en una franja sobre la barra de escribir. El chat se apoya abajo. El modo (IA local o básico) es un icono junto al título (lo pone app/).

import { Bot, Building2, Send } from 'lucide-react-native';
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
import { Chip } from '../../../../shared/ui/Chip';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import { CIUDADES } from '../../constantes';
import type { CasosAgente } from '../../domain/interfaces';
import type { ContextoAlojamiento, Mensaje, Opcion, PasoId } from '../../domain/modelos';
import { faltantes, recomendar } from '../../domain/plan';
import { PlanPuntos } from '../componentes/PlanPuntos';
import { PuntosEscribiendo } from '../componentes/PuntosEscribiendo';
import { TarjetaOpcion } from '../componentes/TarjetaOpcion';
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
  /** El alojamiento elegido en el explorador. Con él, la reserva se limita a ese alojamiento. */
  contexto?: ContextoAlojamiento | null;
  /**
   * Identifica CADA llegada desde un alojamiento: cuando cambia, la conversación empieza de nuevo con el `contexto`.
   * Volver a la pestaña con la misma clave no borra lo que ya se habló.
   */
  claveContexto?: number;
}

const POLL_COLA_MS = 3_000;
const DIA_MS = 24 * 60 * 60 * 1000;
const CIUDADES_RAPIDAS = CIUDADES.slice(0, 4);
const PERSONAS_RAPIDAS = [1, 2, 3, 4];

/** Qué dice el chat mientras el agente trabaja en cada paso. */
const ACTIVIDAD: Partial<Record<PasoId, string>> = {
  ENTENDER: 'Entendiendo tu pedido',
  BUSCAR: 'Buscando alojamientos',
  VERIFICAR: 'Verificando disponibilidad',
  RESERVAR: 'Creando la reserva',
};

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

function nochesEntre(entrada?: string, salida?: string): number | null {
  if (!entrada || !salida) return null;
  const n = (Date.parse(`${salida}T00:00:00Z`) - Date.parse(`${entrada}T00:00:00Z`)) / DIA_MS;
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : null;
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

function insigniasDe(indice: number, o: Opcion, todas: Opcion[], indiceRecomendada: number | null): string[] {
  const etiquetas: string[] = [];
  if (indice === indiceRecomendada) etiquetas.push('Recomendada');
  if (todas.length >= 2) {
    const masBarata = Math.min(...todas.map((x) => x.precioNoche));
    const mayorCapacidad = Math.max(...todas.map((x) => x.capacidad));
    const menorCapacidad = Math.min(...todas.map((x) => x.capacidad));
    if (o.precioNoche === masBarata) etiquetas.push('Económico');
    else if (o.capacidad === mayorCapacidad && mayorCapacidad > menorCapacidad) etiquetas.push('Espacioso');
  }
  return etiquetas;
}

export function PantallaAgente({
  casos,
  alPagar,
  resolverReservaEnCola,
  contexto,
  claveContexto,
}: Props) {
  const { estado, ocupado, enviar, elegir, confirmar, rechazar, reiniciar } = useAgente(casos, contexto ?? undefined);
  // La primera conversación ya nació con el contexto; solo una llegada NUEVA (otra clave) la reinicia.
  const claveAtendida = useRef(claveContexto);
  useEffect(() => {
    if (claveContexto === claveAtendida.current) return;
    claveAtendida.current = claveContexto;
    reiniciar(contexto ?? undefined);
  }, [claveContexto, contexto, reiniciar]);
  const [texto, setTexto] = useState('');
  const [verPlan, setVerPlan] = useState(false);
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

  const mandar = (contenido: string) => {
    const t = contenido.trim();
    if (!t || ocupado) return;
    setTexto('');
    void enviar(t);
  };

  const ultimoDelAgente = [...estado.mensajes].reverse().find((m) => m.rol === 'agente')?.id;
  const recomendada = estado.fase === 'ELIGIENDO' ? recomendar(estado.opciones, estado.criterios) : null;
  const noches = nochesEntre(estado.criterios.checkIn, estado.criterios.checkOut);
  const pasoActivo = estado.plan.find((p) => p.estado === 'EN_CURSO');
  const actividad = (pasoActivo && ACTIVIDAD[pasoActivo.id]) ?? 'Trabajando en tu pedido';
  const buscando = pasoActivo?.id === 'BUSCAR';

  // Respuestas rápidas a lo que el agente pregunta (ciudad o personas). Salen en la franja sobre la barra de escribir.
  // Elegir una opción y confirmar ya tienen sus propios botones en el chat (tarjetas y "Sí, reservar"), por eso no se repiten aquí.
  const falta = estado.fase === 'CONVERSANDO' ? faltantes(estado.criterios)[0] : undefined;
  const rapidas: { etiqueta: string; accion: () => void }[] = [];
  if (falta === 'ciudad') {
    CIUDADES_RAPIDAS.forEach((c) => rapidas.push({ etiqueta: c, accion: () => mandar(`en ${c}`) }));
  } else if (falta === 'huespedes') {
    PERSONAS_RAPIDAS.forEach((n) =>
      rapidas.push({ etiqueta: `${n} persona${n === 1 ? '' : 's'}`, accion: () => mandar(`${n} personas`) }),
    );
  }

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Cabecera fija: alojamiento elegido (si hay) y avance del agente. El modo (IA local o básico) es el punto del título. */}
      <View style={estilos.cabecera}>
        {estado.alojamiento ? (
          <View style={estilos.cabeceraFila}>
            <View style={{ flexShrink: 1 }}>
              <Insignia texto={`Reservando en ${estado.alojamiento.titulo}`} tono="exito" />
            </View>
          </View>
        ) : null}
        <PlanPuntos plan={estado.plan} abierto={verPlan} alAlternar={() => setVerPlan((v) => !v)} />
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        {estado.mensajes.map((m) => {
          const esUsuario = m.rol === 'usuario';
          const mostrar =
            !esUsuario && estado.fase === 'ELIGIENDO' && m.id === ultimoDelAgente ? quitarListaDeOpciones(m.texto) : m.texto;
          return (
            <View key={m.id} style={[estilos.filaMensaje, esUsuario && { justifyContent: 'flex-end' }]}>
              {!esUsuario && <Avatar />}
              <View style={{ maxWidth: '84%', alignItems: esUsuario ? 'flex-end' : 'flex-start' }}>
                <View style={[estilos.burbuja, esUsuario ? estilos.usuario : estilos.agente]}>
                  <Text style={esUsuario ? estilos.textoUsuario : estilos.textoAgente}>{mostrar}</Text>
                </View>
                <Text style={estilos.hora}>{formatearHora(horas.get(m.id) ?? Date.now())}</Text>
              </View>
            </View>
          );
        })}

        {ocupado && (
          <>
            <View style={estilos.filaMensaje}>
              <Avatar />
              <View style={[estilos.burbuja, estilos.agente, estilos.escribiendo]}>
                <Text style={estilos.textoAgente}>{actividad}</Text>
                <PuntosEscribiendo />
              </View>
            </View>
            {buscando && estado.criterios.ciudad ? (
              <View style={estilos.progresoBusqueda}>
                <View style={estilos.progresoIcono}>
                  <Building2 color={COLOR.primario} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.progresoTitulo}>{estado.criterios.ciudad}</Text>
                  <Text style={estilos.progresoTexto}>Filtrando opciones disponibles…</Text>
                </View>
              </View>
            ) : null}
          </>
        )}

        {estado.fase === 'ELIGIENDO' &&
          estado.opciones.map((o, i) => (
            <TarjetaOpcion
              key={o.unidadId}
              opcion={o}
              numero={i + 1}
              noches={noches}
              insignias={insigniasDe(i, o, estado.opciones, recomendada?.indice ?? null)}
              deshabilitado={ocupado}
              alElegir={() => void elegir(i)}
            />
          ))}

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
        {terminada && <Boton variante="contorno" titulo="Nueva reserva" onPress={() => reiniciar()} />}
      </ScrollView>

      {!terminada && (
        <View style={[estilos.pie, { paddingBottom: insets.bottom }]}>
          {/* Sugerencias: una sola fila que se desliza, justo sobre la barra de escribir. Solo cuando el agente hace una pregunta. */}
          {rapidas.length > 0 && !ocupado ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={estilos.franja}
              contentContainerStyle={estilos.chips}
              keyboardShouldPersistTaps="handled"
            >
              {rapidas.map((r) => (
                <Chip key={r.etiqueta} etiqueta={r.etiqueta} onPress={r.accion} />
              ))}
            </ScrollView>
          ) : null}
          <View style={estilos.entrada}>
            <TextInput
              style={estilos.input}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribe tu pedido…"
              placeholderTextColor={COLOR.textoSuave}
              editable={!ocupado}
              onSubmitEditing={() => mandar(texto)}
              returnKeyType="send"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar mensaje"
              accessibilityState={{ disabled: ocupado || !texto.trim() }}
              disabled={ocupado || !texto.trim()}
              onPress={() => mandar(texto)}
              style={({ pressed }) => [
                estilos.enviar,
                (ocupado || !texto.trim()) && estilos.enviarInactivo,
                pressed && { backgroundColor: COLOR.primarioPresionado },
              ]}
            >
              {ocupado ? <ActivityIndicator color={COLOR.textoSuave} /> : <Send color={texto.trim() ? '#fff' : COLOR.textoSuave} size={20} />}
            </Pressable>
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
  // flexGrow + flex-end: el chat se apoya abajo (junto a la barra de escribir), como en cualquier app de mensajes.
  contenido: { flexGrow: 1, justifyContent: 'flex-end', padding: ESPACIO.l, gap: ESPACIO.m },

  cabecera: { backgroundColor: COLOR.tarjeta, borderBottomWidth: 1, borderBottomColor: COLOR.borde },
  cabeceraFila: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.m },

  filaMensaje: { flexDirection: 'row', alignItems: 'flex-end', gap: ESPACIO.s },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  burbuja: { paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.m, borderRadius: RADIO.tarjeta },
  usuario: { backgroundColor: COLOR.primario, borderBottomRightRadius: 4 },
  agente: { backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde, borderBottomLeftRadius: 4 },
  escribiendo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  textoUsuario: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: '#fff' },
  textoAgente: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.texto },
  hora: { ...FUENTE.normal, fontSize: TAMANO.pequeno, color: COLOR.textoSuave, marginTop: 4 },

  fila: { flexDirection: 'row', gap: ESPACIO.s },

  // Tarjeta de la búsqueda en curso: queda alineada con el texto de la burbuja (ancho del avatar + separación).
  progresoBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    marginLeft: 40,
    padding: ESPACIO.m,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.campo,
  },
  progresoIcono: { width: 44, height: 44, borderRadius: RADIO.control, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  progresoTitulo: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.texto },
  progresoTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },

  pie: { backgroundColor: COLOR.fondo, borderTopWidth: 1, borderTopColor: COLOR.borde },
  // flexGrow 0: una fila que se desliza de lado no debe crecer hacia abajo.
  franja: { flexGrow: 0 },
  chips: { gap: ESPACIO.s, alignItems: 'center', paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.m },
  entrada: { flexDirection: 'row', gap: ESPACIO.s, padding: ESPACIO.l, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.control,
    paddingHorizontal: ESPACIO.l,
    backgroundColor: COLOR.tarjeta,
    ...FUENTE.normal,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  // Botón de enviar redondo, solo con el icono: azul con texto escrito, gris sin texto.
  enviar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  enviarInactivo: { backgroundColor: COLOR.campo },
});
