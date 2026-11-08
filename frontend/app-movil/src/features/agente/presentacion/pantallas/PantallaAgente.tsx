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
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Chip } from '../../../../shared/ui/Chip';
import { Insignia } from '../../../../shared/ui/Insignia';
import { pluralize } from '../../../../shared/ui/plural';
import { COLOR } from '../../../../shared/ui/tema';
import { CIUDADES_RAPIDAS, PERSONAS_RAPIDAS, POLL_COLA_MS } from '../../constantes';
import type { CasosAgente } from '../../domain/interfaces';
import type { ContextoAlojamiento } from '../../domain/modelos';
import { faltantes, recomendar } from '../../domain/plan';
import { PlanPuntos } from '../componentes/PlanPuntos';
import { PuntosEscribiendo } from '../componentes/PuntosEscribiendo';
import { TarjetaOpcion } from '../componentes/TarjetaOpcion';
import { formatearHora, insigniasDe, nochesEntre, quitarListaDeOpciones } from '../conversacion';
import { ACTIVIDAD, ACTIVIDAD_GENERICA } from '../texts';
import { useAgente } from '../useAgente';
import { useHoras } from '../useHoras';
import { estilos } from './PantallaAgente.styles';

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
  const actividad = (pasoActivo && ACTIVIDAD[pasoActivo.id]) ?? ACTIVIDAD_GENERICA;
  const buscando = pasoActivo?.id === 'BUSCAR';

  // Respuestas rápidas a lo que el agente pregunta (ciudad o personas). Salen en la franja sobre la barra de escribir.
  // Elegir una opción y confirmar ya tienen sus propios botones en el chat (tarjetas y "Sí, reservar"), por eso no se repiten aquí.
  const falta = estado.fase === 'CONVERSANDO' ? faltantes(estado.criterios)[0] : undefined;
  const rapidas: { etiqueta: string; accion: () => void }[] = [];
  if (falta === 'ciudad') {
    CIUDADES_RAPIDAS.forEach((c) => rapidas.push({ etiqueta: c, accion: () => mandar(`en ${c}`) }));
  } else if (falta === 'huespedes') {
    PERSONAS_RAPIDAS.forEach((n) =>
      rapidas.push({ etiqueta: `${n} ${pluralize(n, 'persona', 'personas')}`, accion: () => mandar(`${n} personas`) }),
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
              {ocupado ? <ActivityIndicator color={COLOR.textoSuave} /> : <Send color={texto.trim() ? COLOR.blanco : COLOR.textoSuave} size={20} />}
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
