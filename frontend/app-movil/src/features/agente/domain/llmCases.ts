// ======================================================================
// ARCHIVO: agente/domain/llmCases.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El agente guiado por IA: la IA (Groq) decide qué herramienta usar en cada momento y este archivo las ejecuta contra los microservicios.
// PARA QUÉ SIRVE: Ya no hay un plan fijo para entender al usuario: la IA tiene como contexto las herramientas y la conversación. Si la IA no responde, sigue el modo básico (casos.ts).
// SIN ÉL: El agente solo podría seguir el plan fijo y entender frases simples.
// NO VA AQUÍ: HTTP, React ni la clave de Groq (eso es data/planner.ts).
// ======================================================================
// Garantías que NO dependen de la IA (aunque se equivoque):
//  - La IA NO puede cobrar: `open_payment` solo deja lista la pantalla de pago; el dinero lo mueve el usuario con el QR en su banco.
//  - `confirm_booking` solo crea la reserva si el resumen YA estaba en pantalla antes de este mensaje y el mensaje no trae duda, negación ni cambio.
//  - `cancel_booking` nunca cancela en la misma llamada: la app misma pregunta "¿Seguro?" (texto fijo) y solo cancela si el usuario confirma en SU SIGUIENTE mensaje.
//  - El resumen con el total lo arma el código (casos.ts), no la IA.
//  - Toda herramienta valida sus argumentos; lo inválido vuelve a la IA como error, no rompe nada.
//  - Las herramientas que escriben (confirmar, cancelar, abrir el pago) terminan el turno: nada puede fallar "a medias" después de ellas.
//  - Los textos que escribe el anfitrión llegan recortados y marcados como datos; el PIN de check-in y los ids nunca se le muestran a la IA.

import { AFFIRM_WORDS, AGENT_LLM, DOUBT_PATTERN, LIMITES, MAX_OPCIONES, NUMEROS_EN_PALABRAS, TOOL_LIMITS } from '../constantes';
import { LLM_TEXTS, TOOL_ERRORS } from './llmTexts';
import type { AccommodationDetailsSource, BookingsSource, CasosAgente, CatalogoAlojamientos, Planner, Reservador } from './interfaces';
import type { EstadoAgente, EstadoPaso, Opcion, PasoId, PlannerMessage, PlannerReply, ToolCall } from './modelos';
import { descripcionOpcion, faltantes, interpretarConfirmacion, interpretarEleccion, marcar, mezclar, normalizar, preguntaPara, reiniciarDesde } from './plan';
import { availableToolSpecs, buildSystemPrompt, TOOL } from './tools';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const asText = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t && t.length <= LIMITES.CIUDAD_MAX_CHARS ? t : undefined;
};
const asInt = (v: unknown, min: number, max: number): number | undefined => {
  const n = typeof v === 'string' && v.trim() === '' ? NaN : Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};
const asPositive = (v: unknown, max: number): number | undefined => {
  const n = typeof v === 'string' && v.trim() === '' ? NaN : Number(v);
  return Number.isFinite(n) && n > 0 && n <= max ? n : undefined;
};
const asDate = (v: unknown): string | undefined => (typeof v === 'string' && FECHA.test(v) ? v : undefined);
const clip = (t: string | undefined): string | undefined => (t && t.length > TOOL_LIMITS.FREE_TEXT_MAX_CHARS ? `${t.slice(0, TOOL_LIMITS.FREE_TEXT_MAX_CHARS)}…` : t);

const say = (e: EstadoAgente, rol: 'usuario' | 'agente', texto: string): EstadoAgente => ({
  ...e,
  mensajes: [...e.mensajes, { id: e.mensajes.length + 1, rol, texto }],
});
const mark = (e: EstadoAgente, id: PasoId, estado: EstadoPaso, nota?: string): EstadoAgente => ({ ...e, plan: marcar(e.plan, id, estado, nota) });
const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Ocurrió un error inesperado.');

/** Lo que la IA ve de una opción (el usuario ve la tarjeta completa). */
const summary = (o: Opcion, n: number) => ({
  n,
  alojamiento: o.titulo,
  habitacion: o.unidadNombre,
  ciudad: o.ciudad,
  capacidad: o.capacidad,
  precioNocheBs: o.precioNoche,
  calificacion: o.calificacion ?? null,
});

interface ToolOutcome {
  state: EstadoAgente;
  result: Record<string, unknown>;
  /** La herramienta ya dejó el mensaje final para el usuario: el turno termina aquí. */
  done?: boolean;
}

/** Lo que cada herramienta necesita saber del mensaje que se está atendiendo. */
interface TurnContext {
  /** El estado CON el mensaje del usuario, si al empezar el turno ya había un resumen esperando confirmación; si no, null. */
  pending: EstadoAgente | null;
  text: string;
}

const countUserMessages = (e: EstadoAgente) => e.mensajes.filter((m) => m.rol === 'usuario').length;
const hasDoubt = (text: string) => DOUBT_PATTERN.test(normalizar(text));
const words = (text: string) => ` ${normalizar(text).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
/** ¿El mensaje dice que sí? Debe traer una palabra afirmativa y ninguna de duda, negación o cambio. */
const isClearYes = (text: string) => interpretarConfirmacion(text) !== 'NO' && !hasDoubt(text) && AFFIRM_WORDS.some((w) => words(text).includes(` ${w} `));

/**
 * ¿El usuario dijo en algún mensaje que son `n` personas? La IA a veces inventa el número ("2") cuando no se lo dijeron:
 * solo se acepta si aparece como "somos 2", "para dos", "2 personas", "pareja", "solo"...
 */
function guestsMentioned(e: EstadoAgente, n: number): boolean {
  const forms = [String(n), ...Object.entries(NUMEROS_EN_PALABRAS).filter(([, v]) => v === n).map(([w]) => w)].join('|');
  const before = new RegExp(`\\b(somos|para|con|de|x)\\s*(${forms})\\b`);
  const after = new RegExp(`\\b(${forms})\\s*(personas?|huespedes?|pax|adultos?|viajeros?|amigos?|ninos?|hijos?)\\b`);
  return e.mensajes
    .filter((m) => m.rol === 'usuario')
    .map((m) => normalizar(m.texto))
    .some((t) => before.test(t) || after.test(t) || (n === 2 && /\bpareja\b/.test(t)) || (n === 1 && /\b(solo|sola)\b/.test(t)));
}

export function createLlmAgentCases(deps: {
  planner: Planner;
  catalogo: CatalogoAlojamientos;
  reservador: Reservador;
  /** Opcionales: sin ellas, la herramienta correspondiente no se le ofrece a la IA. */
  details?: AccommodationDetailsSource;
  bookings?: BookingsSource;
  /** El agente de siempre (modo básico): atiende cuando la IA no responde y hace la confirmación y la reserva. */
  fallback: CasosAgente;
  /** Hoy en Bolivia, 'YYYY-MM-DD'. */
  today: () => string;
  now?: () => number;
}): CasosAgente {
  const { planner, catalogo, reservador, fallback } = deps;
  const now = deps.now ?? Date.now;
  const toolSpecs = availableToolSpecs({ details: !!deps.details, bookings: !!deps.bookings });
  /** Hasta cuándo se atiende en modo básico sin volver a intentar la IA. */
  let pausedUntil = 0;

  // --- herramientas -----------------------------------------------------------

  async function search(s: EstadoAgente, args: Record<string, unknown>): Promise<ToolOutcome> {
    const ciudad = asText(args.ciudad);
    const given = asInt(args.huespedes, 1, LIMITES.HUESPEDES_MAX);
    // Un número de personas que el usuario nunca dijo se ignora (la IA a veces lo inventa).
    const huespedes = given && (given === s.criterios.huespedes || guestsMentioned(s, given)) ? given : undefined;
    const presupuesto = asPositive(args.presupuestoMaxNoche, LIMITES.PRESUPUESTO_MAX);

    let state = s;
    // Si pide otra ciudad, ya no quiere ese alojamiento: se deja de limitar la búsqueda.
    if (state.alojamiento && ciudad && normalizar(ciudad) !== normalizar(state.alojamiento.ciudad)) state = { ...state, alojamiento: null };
    const criterios = mezclar(state.criterios, {
      ...(ciudad ? { ciudad } : {}),
      ...(huespedes ? { huespedes } : {}),
      ...(presupuesto ? { presupuestoMaxNoche: presupuesto } : {}),
    });
    state = mark(mark({ ...state, criterios }, 'ENTENDER', 'HECHO'), 'COMPLETAR_DATOS', 'HECHO');
    if (!criterios.ciudad) return { state, result: { error: TOOL_ERRORS.MISSING_CITY } };

    state = mark(state, 'BUSCAR', 'EN_CURSO');
    let encontradas: Opcion[];
    try {
      encontradas = await catalogo.buscar(criterios);
    } catch (err) {
      return { state: mark(state, 'BUSCAR', 'FALLIDO', errorText(err)), result: { error: TOOL_ERRORS.CATALOG_DOWN } };
    }
    const fijo = state.alojamiento;
    if (fijo) encontradas = encontradas.filter((o) => o.alojamientoId === fijo.id);
    const opciones = [...encontradas].sort((a, b) => a.precioNoche - b.precioNoche).slice(0, MAX_OPCIONES);

    if (opciones.length === 0) {
      return {
        state: mark({ ...state, fase: 'CONVERSANDO', opciones: [], eleccion: null }, 'BUSCAR', 'FALLIDO', 'Sin resultados'),
        result: { total: 0, mensaje: TOOL_ERRORS.NO_RESULTS },
      };
    }
    return {
      state: mark(mark({ ...state, fase: 'ELIGIENDO', opciones, eleccion: null }, 'BUSCAR', 'HECHO', `${opciones.length} opciones`), 'ELEGIR', 'EN_CURSO'),
      result: { total: opciones.length, resultados: opciones.map((o, i) => summary(o, i + 1)) },
    };
  }

  /** Valida n y las fechas de una herramienta; devuelve el error para la IA o los datos limpios. */
  function readBooking(s: EstadoAgente, args: Record<string, unknown>) {
    const n = asInt(args.n, 1, Math.max(s.opciones.length, 1));
    const opcion = n && s.opciones[n - 1];
    if (!n || !opcion) return { error: TOOL_ERRORS.BAD_OPTION(s.opciones.length) } as const;
    const checkIn = asDate(args.checkIn);
    const checkOut = asDate(args.checkOut);
    if (!checkIn || !checkOut) return { error: TOOL_ERRORS.BAD_DATES } as const;
    // La IA a veces se equivoca de año: una entrada pasada se rechaza aquí, sin depender de ella.
    const hoy = deps.today();
    if (checkIn < hoy) return { error: TOOL_ERRORS.PAST_DATE(checkIn, hoy) } as const;
    const problema = reservador.validarFechas(checkIn, checkOut);
    if (problema) return { error: problema } as const;
    return { n, opcion, checkIn, checkOut } as const;
  }

  async function check(s: EstadoAgente, args: Record<string, unknown>): Promise<ToolOutcome> {
    const datos = readBooking(s, args);
    if ('error' in datos) return { state: s, result: { error: datos.error } };
    const { opcion, checkIn, checkOut } = datos;
    try {
      const disponible = await reservador.verificarDisponibilidad(opcion.unidadId, checkIn, checkOut);
      const noches = reservador.noches(checkIn, checkOut) ?? 0;
      return {
        state: { ...s, criterios: mezclar(s.criterios, { checkIn, checkOut }) },
        result: { disponible, noches, totalBs: noches * opcion.precioNoche },
      };
    } catch {
      return { state: s, result: { error: TOOL_ERRORS.AVAILABILITY_DOWN } };
    }
  }

  async function propose(s: EstadoAgente, args: Record<string, unknown>): Promise<ToolOutcome> {
    const datos = readBooking(s, args);
    if ('error' in datos) return { state: s, result: { error: datos.error } };
    const given = asInt(args.huespedes, 1, LIMITES.HUESPEDES_MAX);
    // Solo vale un número de personas que el usuario dijo (o que ya estaba confirmado en el pedido): nunca uno inventado.
    if (given && given !== s.criterios.huespedes && !guestsMentioned(s, given)) return { state: s, result: { error: TOOL_ERRORS.GUESTS_NOT_SAID } };
    const huespedes = given ?? s.criterios.huespedes;
    if (!huespedes) return { state: s, result: { error: TOOL_ERRORS.MISSING_GUESTS } };

    // Verificar y armar el resumen lo hace el modo básico (código): una sola fuente para el total y para los avisos.
    const preparado = mark(
      mark({ ...s, criterios: mezclar(s.criterios, { checkIn: datos.checkIn, checkOut: datos.checkOut, huespedes }), fase: 'ELIGIENDO' }, 'ENTENDER', 'HECHO'),
      'COMPLETAR_DATOS',
      'HECHO',
    );
    const r = await fallback.elegirOpcion(preparado, datos.n - 1);
    if (r.fase === 'CONFIRMANDO') return { state: r, result: { ok: true, mensaje: TOOL_ERRORS.PROPOSED } };

    // No se pudo (no disponible, error de red): el texto fijo del modo básico se descarta y la IA lo explica a su manera.
    const motivo = r.mensajes.length > s.mensajes.length ? (r.mensajes[r.mensajes.length - 1]?.texto ?? TOOL_ERRORS.NOT_PROPOSED) : TOOL_ERRORS.NOT_PROPOSED;
    return {
      state: { ...r, mensajes: r.mensajes.slice(0, s.mensajes.length) },
      result: { ok: false, motivo, opcionesRestantes: r.opciones.map((o, i) => summary(o, i + 1)) },
    };
  }

  /** Ficha completa de una opción (o del alojamiento fijo si el usuario viene de su ficha). No cambia el estado. */
  async function details(s: EstadoAgente, args: Record<string, unknown>): Promise<ToolOutcome> {
    if (!deps.details) return { state: s, result: { error: TOOL_ERRORS.DETAILS_UNAVAILABLE } };
    let id: string | undefined;
    if (args.n !== undefined && args.n !== null) {
      const n = asInt(args.n, 1, Math.max(s.opciones.length, 1));
      const opcion = n ? s.opciones[n - 1] : undefined;
      if (!opcion) return { state: s, result: { error: TOOL_ERRORS.BAD_OPTION(s.opciones.length) } };
      id = opcion.alojamientoId;
    } else {
      id = s.alojamiento?.id;
    }
    if (!id) return { state: s, result: { error: TOOL_ERRORS.NO_TARGET } };
    try {
      const d = await deps.details.details(id);
      return {
        state: s,
        result: {
          nota: TOOL_ERRORS.HOST_TEXT_NOTE,
          alojamiento: d.titulo,
          tipo: d.tipo,
          ciudad: d.ciudad,
          direccion: d.direccion,
          descripcion: clip(d.descripcion),
          politicas: clip(d.politicas),
          horarioEntrada: d.horarioEntrada,
          horarioSalida: d.horarioSalida,
          servicios: d.servicios.slice(0, TOOL_LIMITS.SERVICES_MAX),
          calificacion: d.calificacion,
          totalResenas: d.totalResenas,
        },
      };
    } catch {
      return { state: s, result: { error: TOOL_ERRORS.DETAILS_DOWN } };
    }
  }

  /** Reservas recientes del usuario. Solo lectura. */
  async function bookings(s: EstadoAgente): Promise<ToolOutcome> {
    if (!deps.bookings) return { state: s, result: { error: TOOL_ERRORS.DETAILS_UNAVAILABLE } };
    try {
      const todas = await deps.bookings.list();
      if (todas.length === 0) return { state: s, result: { total: 0, mensaje: TOOL_ERRORS.NO_BOOKINGS } };
      // La IA nombra las reservas por número: el id interno no se le muestra.
      const reservas = todas.slice(0, TOOL_LIMITS.BOOKINGS_MAX).map(({ id: _id, ...rest }, i) => ({ n: i + 1, ...rest }));
      return { state: s, result: { total: todas.length, reservas } };
    } catch {
      return { state: s, result: { error: TOOL_ERRORS.BOOKINGS_DOWN } };
    }
  }

  /** Busca la reserva n de la lista reciente (de nuevo en el servidor, para no actuar sobre una lista vieja). */
  async function pickBooking(args: Record<string, unknown>) {
    if (!deps.bookings) return { error: TOOL_ERRORS.DETAILS_UNAVAILABLE } as const;
    let list;
    try {
      list = (await deps.bookings.list()).slice(0, TOOL_LIMITS.BOOKINGS_MAX);
    } catch {
      return { error: TOOL_ERRORS.BOOKINGS_DOWN } as const;
    }
    const n = asInt(args.n, 1, Math.max(list.length, 1));
    const booking = n ? list[n - 1] : undefined;
    if (!booking) return { error: TOOL_ERRORS.BAD_BOOKING(list.length) } as const;
    return { booking } as const;
  }

  /** Crea la reserva que el usuario ya vio en el resumen. Los candados están aquí, no en la IA. */
  async function confirm(s: EstadoAgente, turn: TurnContext): Promise<ToolOutcome> {
    if (!turn.pending) return { state: s, result: { error: TOOL_ERRORS.NOT_PENDING_CONFIRM } };
    if (!isClearYes(turn.text)) return { state: s, result: { error: TOOL_ERRORS.UNCLEAR_YES } };
    // La reserva la crea el mismo código del botón "Sí, reservar": una sola fuente de verdad, con el total que el usuario vio.
    const r = await fallback.confirmar(turn.pending);
    if (r.fase === 'RESERVADO' || r.fase === 'EN_COLA') return { state: r, result: { ok: true, mensaje: TOOL_ERRORS.CONFIRMED }, done: true };
    return { state: r, result: { ok: false, error: TOOL_ERRORS.NOT_PROPOSED }, done: true };
  }

  /** Cancela en dos tiempos: la primera llamada solo prepara; cancela si el usuario confirma en su SIGUIENTE mensaje. */
  async function cancel(s: EstadoAgente, args: Record<string, unknown>, turn: TurnContext): Promise<ToolOutcome> {
    const picked = await pickBooking(args);
    if ('error' in picked) return { state: s, result: { error: picked.error } };
    const { booking } = picked;
    if (asDate(args.checkIn) !== booking.checkIn) return { state: s, result: { error: TOOL_ERRORS.BOOKING_MISMATCH } };
    if (booking.estado !== 'PENDIENTE_PAGO') return { state: s, result: { error: TOOL_ERRORS.NOT_CANCELLABLE } };

    const userTurn = countUserMessages(s);
    const pending = s.cancelacionPendiente;
    if (!pending || pending.id !== booking.id || pending.turno !== userTurn - 1) {
      // La primera llamada solo prepara: la pregunta la hace el código y el turno termina (no se cancela en el mismo mensaje).
      const question = LLM_TEXTS.CANCEL_QUESTION(booking.alojamiento, booking.checkIn, booking.checkOut);
      return {
        state: say({ ...s, cancelacionPendiente: { id: booking.id, turno: userTurn } }, 'agente', question),
        result: { pendiente: true, mensaje: TOOL_ERRORS.CANCEL_ASK },
        done: true,
      };
    }
    if (!isClearYes(turn.text)) {
      return { state: { ...s, cancelacionPendiente: null }, result: { error: TOOL_ERRORS.UNCLEAR_YES } };
    }
    try {
      await deps.bookings?.cancel(booking.id);
    } catch (err) {
      return { state: { ...s, cancelacionPendiente: null }, result: { error: errorText(err) } };
    }
    return { state: say({ ...s, cancelacionPendiente: null }, 'agente', LLM_TEXTS.CANCELLED), result: { ok: true, mensaje: TOOL_ERRORS.CANCEL_DONE }, done: true };
  }

  /** Deja lista la pantalla de pago ("Pagar ahora"). No paga: el dinero lo mueve el usuario con el QR en su banco. */
  async function openPayment(s: EstadoAgente, args: Record<string, unknown>): Promise<ToolOutcome> {
    const picked = await pickBooking(args);
    if ('error' in picked) return { state: s, result: { error: picked.error } };
    if (!picked.booking.sePuedePagar) return { state: s, result: { error: TOOL_ERRORS.NOT_PAYABLE } };
    const listo = mark(mark({ ...s, fase: 'RESERVADO', reservaId: picked.booking.id, eleccion: null }, 'RESERVAR', 'HECHO'), 'PAGAR', 'EN_CURSO', 'Págalo desde la pantalla de pago');
    return { state: say(listo, 'agente', LLM_TEXTS.PAY_READY), result: { ok: true, mensaje: TOOL_ERRORS.CONFIRMED }, done: true };
  }

  async function runTool(s: EstadoAgente, call: ToolCall, turn: TurnContext): Promise<ToolOutcome> {
    switch (call.name) {
      case TOOL.CONFIRM:
        return confirm(s, turn);
      case TOOL.CANCEL:
        return cancel(s, call.arguments, turn);
      case TOOL.PAY:
        return openPayment(s, call.arguments);
      case TOOL.DETAILS:
        return details(s, call.arguments);
      case TOOL.BOOKINGS:
        return bookings(s);
      case TOOL.SEARCH:
        return search(s, call.arguments);
      case TOOL.CHECK:
        return check(s, call.arguments);
      case TOOL.PROPOSE:
        return propose(s, call.arguments);
      default:
        return { state: s, result: { error: TOOL_ERRORS.UNKNOWN_TOOL(call.name) } };
    }
  }

  // --- el turno guiado por la IA ----------------------------------------------

  /** Lo que la IA ve de la conversación: los mensajes recientes (empezando por uno del usuario). */
  function transcript(e: EstadoAgente): PlannerMessage[] {
    const msgs: PlannerMessage[] = e.mensajes
      .filter((m) => m.texto !== LLM_TEXTS.DEGRADED)
      .slice(-AGENT_LLM.HISTORY_MESSAGES)
      .map((m) => ({ role: m.rol === 'usuario' ? 'user' : 'assistant', content: m.texto }));
    while (msgs[0]?.role === 'assistant') msgs.shift();
    return msgs;
  }

  /** Devuelve el estado nuevo, o null si la IA no está disponible (entonces atiende el modo básico). */
  async function llmTurn(estado: EstadoAgente, texto: string): Promise<EstadoAgente | null> {
    let s = say(estado, 'usuario', texto);
    // Si ya había un resumen en pantalla, `confirm_booking` puede crear la reserva (solo en ese caso).
    const turn: TurnContext = { pending: s.fase === 'CONFIRMANDO' ? s : null, text: texto };
    // Si estaba esperando el "sí" y el usuario escribe otra cosa, quiere cambiar algo: se vuelve a elegir.
    if (s.fase === 'CONFIRMANDO') {
      s = { ...s, fase: s.opciones.length ? 'ELIGIENDO' : 'CONVERSANDO', eleccion: null, plan: reiniciarDesde(s.plan, 'ELEGIR') };
    }
    const system = buildSystemPrompt(s, deps.today(), turn.pending);
    let working = transcript(s);
    let final: string | null = null;

    for (let step = 0; step < AGENT_LLM.MAX_STEPS; step++) {
      let reply: PlannerReply;
      try {
        reply = await planner.turn({ system, messages: working, tools: toolSpecs });
      } catch (err) {
        console.warn('La IA del agente no respondió, sigo en modo básico', errorText(err));
        return null;
      }
      if (reply.toolCalls.length === 0) {
        final = reply.text;
        break;
      }
      working = [...working, { role: 'assistant', content: reply.text, toolCalls: reply.toolCalls }];
      for (const call of reply.toolCalls) {
        const out = await runTool(s, call, turn);
        s = out.state;
        working = [...working, { role: 'tool', content: JSON.stringify(out.result), toolCallId: call.id }];
        // Termina el turno: la IA propuso la reserva (el resumen espera el "sí"), o el código ya dejó el mensaje final
        // (reserva creada, cancelada o pago listo). Nada más se ejecuta ni se le pregunta a la IA después de una acción.
        if (out.done || s.fase === 'CONFIRMANDO') return s;
      }
    }

    const texto2 = final?.trim();
    if (texto2) return say(s, 'agente', texto2);
    if (s.fase === 'ELIGIENDO' && s.opciones.length) {
      const lista = s.opciones.map((o, i) => descripcionOpcion(o, i + 1)).join('\n');
      return say(s, 'agente', `${LLM_TEXTS.OPTIONS_INTRO}\n${lista}\n\n${LLM_TEXTS.PICK}`);
    }
    return say(s, 'agente', LLM_TEXTS.NO_REPLY);
  }

  /**
   * La app preguntó "¿Seguro que quieres cancelar?" y el usuario contesta con un sí o no claro: se resuelve con reglas
   * exactas, sin IA, igual que el "sí" de la reserva. Solo vale para el mensaje inmediatamente siguiente a la pregunta.
   */
  async function answerCancellation(estado: EstadoAgente, texto: string): Promise<EstadoAgente | null> {
    const pending = estado.cancelacionPendiente;
    if (!pending || !deps.bookings || pending.turno !== countUserMessages(estado)) return null;
    const answer = interpretarConfirmacion(texto);
    if (answer === null) return null;
    const asked = say({ ...estado, cancelacionPendiente: null }, 'usuario', texto);
    if (answer === 'NO') return say(asked, 'agente', LLM_TEXTS.CANCEL_ABORTED);
    try {
      await deps.bookings.cancel(pending.id);
      return say(asked, 'agente', LLM_TEXTS.CANCELLED);
    } catch (err) {
      return say(asked, 'agente', `No pude cancelarla: ${errorText(err)}`);
    }
  }

  // --- API pública ------------------------------------------------------------
  const casos: CasosAgente = {
    iniciar: fallback.iniciar,
    confirmar: fallback.confirmar,
    rechazar: fallback.rechazar,

    async enviarMensaje(estado, texto) {
      const limpio = texto.trim();
      if (!limpio) return estado;

      // El "sí / no", elegir por número y una reserva ya hecha se resuelven con reglas exactas: no necesitan IA.
      if (estado.fase === 'CONFIRMANDO' && interpretarConfirmacion(limpio) !== null) return fallback.enviarMensaje(estado, limpio);
      if (estado.fase === 'RESERVADO' || estado.fase === 'EN_COLA' || estado.fase === 'TERMINADO') return fallback.enviarMensaje(estado, limpio);
      const cancelled = await answerCancellation(estado, limpio);
      if (cancelled) return cancelled;
      if (estado.fase === 'ELIGIENDO') {
        const n = interpretarEleccion(limpio, estado.opciones.length);
        if (n !== null) return casos.elegirOpcion(say(estado, 'usuario', limpio), n);
      }

      if (now() >= pausedUntil) {
        const viaIa = await llmTurn(estado, limpio);
        if (viaIa) return viaIa;
        pausedUntil = now() + AGENT_LLM.COOLDOWN_MS;
      }
      const r = await fallback.enviarMensaje(estado, limpio);
      return r.mensajes.some((m) => m.texto === LLM_TEXTS.DEGRADED) ? r : say(r, 'agente', LLM_TEXTS.DEGRADED);
    },

    elegirOpcion(estado, indice) {
      if (estado.fase !== 'ELIGIENDO') return Promise.resolve(estado);
      const { checkIn, checkOut, huespedes } = estado.criterios;
      if (checkIn && checkOut && huespedes) return fallback.elegirOpcion(estado, indice);
      // Tocó una tarjeta pero aún faltan datos: se pide el dato que falta.
      const falta = faltantes(estado.criterios)[0] ?? 'fechas';
      return Promise.resolve(say(estado, 'agente', `${LLM_TEXTS.NEED_DATA_FIRST} ${preguntaPara(falta)}`));
    },
  };
  return casos;
}
