// ======================================================================
// ARCHIVO: agente/data/planner.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La conexión con la IA que planea: le manda la conversación y las herramientas a Groq y entiende qué respondió.
// PARA QUÉ SIRVE: Que el agente use una IA grande en la nube: directo con la clave de la app (createGroqPlanner) o, sin clave, a través de MS-04 (createRemotePlanner).
// SIN ÉL: El agente solo podría usar el modo básico.
// NO VA AQUÍ: Ejecutar las herramientas ni decidir qué hacer con la respuesta (eso es domain/llmCases.ts).
// ======================================================================

import type { Api } from '../../../core';
import { GROQ, RUTA_IA_AGENTE_TURNO } from '../constantes';
import type { Planner } from '../domain/interfaces';
import type { PlannerMessage, PlannerReply, ToolCall } from '../domain/modelos';
import type { MensajeAgenteDto, PeticionTurnoAgenteDto } from './modelos';

const toDto = (m: PlannerMessage): MensajeAgenteDto => ({
  rol: m.role,
  contenido: m.content,
  ...(m.toolCalls ? { llamadas: m.toolCalls.map((c) => ({ id: c.id, nombre: c.name, argumentos: c.arguments })) } : {}),
  ...(m.toolCallId ? { llamadaId: m.toolCallId } : {}),
});

/** Valida lo que llega de la nube: una respuesta rara cuenta como falla (y el agente sigue en modo básico), no rompe nada. */
export function replyFromDto(resp: unknown): PlannerReply {
  if (typeof resp !== 'object' || resp === null) throw new Error('Respuesta inválida del asistente');
  const r = resp as Record<string, unknown>;
  const text = typeof r.texto === 'string' && r.texto.trim() ? r.texto.trim() : null;
  const toolCalls: ToolCall[] = [];
  if (Array.isArray(r.llamadas)) {
    for (const raw of r.llamadas) {
      if (typeof raw !== 'object' || raw === null) continue;
      const c = raw as Record<string, unknown>;
      if (typeof c.id !== 'string' || typeof c.nombre !== 'string' || !c.nombre) continue;
      const args = typeof c.argumentos === 'object' && c.argumentos !== null && !Array.isArray(c.argumentos) ? (c.argumentos as Record<string, unknown>) : {};
      toolCalls.push({ id: c.id, name: c.nombre, arguments: args });
    }
  }
  if (text === null && toolCalls.length === 0) throw new Error('El asistente no devolvió nada');
  return { text, toolCalls };
}

const toGroqMessages = (system: string, messages: PlannerMessage[]): Record<string, unknown>[] => [
  { role: 'system', content: system },
  ...messages.map((m) => {
    if (m.role === 'tool') return { role: 'tool', tool_call_id: m.toolCallId ?? '', content: m.content ?? '' };
    if (m.role === 'assistant') {
      return {
        role: 'assistant',
        content: m.content ?? '',
        ...(m.toolCalls?.length
          ? { tool_calls: m.toolCalls.map((c) => ({ id: c.id, type: 'function', function: { name: c.name, arguments: JSON.stringify(c.arguments) } })) }
          : {}),
      };
    }
    return { role: 'user', content: m.content ?? '' };
  }),
];

/** Convierte la respuesta de Groq (formato OpenAI) a la misma forma que usa el resto del feature, validándola igual. */
export function replyFromGroq(resp: unknown): PlannerReply {
  const message = (resp as { choices?: { message?: Record<string, unknown> }[] } | null)?.choices?.[0]?.message;
  if (!message) throw new Error('Respuesta inválida del asistente');
  const calls = Array.isArray(message.tool_calls) ? (message.tool_calls as Record<string, unknown>[]) : [];
  return replyFromDto({
    texto: message.content,
    llamadas: calls.map((c, i) => {
      const fn = (c.function ?? {}) as Record<string, unknown>;
      let args: unknown = {};
      try {
        args = JSON.parse(typeof fn.arguments === 'string' && fn.arguments ? fn.arguments : '{}');
      } catch {
        args = {};
      }
      return { id: typeof c.id === 'string' && c.id ? c.id : `call_${i}`, nombre: fn.name, argumentos: args };
    }),
  });
}

/**
 * Cuánto esperar antes de repetir la consulta a Groq, o null si repetir no sirve (se pasa al otro modelo):
 *  - 400 `tool_use_failed`: el modelo armó mal la llamada a una herramienta; es al azar, repetir suele bastar (sin espera).
 *  - 429 (límite de tokens por minuto): Groq dice cuánto esperar ("try again in 2.5s"); si es poco, se espera.
 *  - 5xx: un fallo pasajero del servidor.
 */
export function retryWaitMs(status: number, body: string): number | null {
  if (status === 400) return body.includes('tool_use_failed') ? 0 : null;
  if (status === 429) {
    const seconds = Number(/try again in ([\d.]+)s/i.exec(body)?.[1]);
    if (!Number.isFinite(seconds)) return null;
    const ms = Math.ceil(seconds * 1000) + GROQ.RETRY_MARGIN_MS;
    return ms <= GROQ.RETRY_MAX_WAIT_MS ? ms : null;
  }
  return status >= 500 ? GROQ.RETRY_SERVER_MS : null;
}

/**
 * Habla con Groq directo desde la app. OJO: la clave queda dentro de la app instalada (cualquiera con el APK puede sacarla);
 * úsalo solo en demos. Prueba los modelos en orden y repite una vez si el fallo es pasajero; si ninguno responde,
 * lanza error y el agente sigue en modo básico.
 */
export function createGroqPlanner(deps: { apiKey: string; fetchFn?: typeof fetch; sleepFn?: (ms: number) => Promise<void> }): Planner {
  const doFetch = deps.fetchFn ?? fetch;
  const sleep = deps.sleepFn ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  /** Una consulta a un modelo: devuelve la respuesta, o cuánto esperar para repetirla; lanza error si repetir no sirve. */
  async function attempt(model: string, payload: Record<string, unknown>): Promise<{ reply: PlannerReply } | { retryAfterMs: number }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GROQ.TIMEOUT_MS);
    try {
      const res = await doFetch(GROQ.URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${deps.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, model, ...(model.startsWith(GROQ.REASONING_MODEL_PREFIX) ? { reasoning_effort: GROQ.REASONING_EFFORT } : {}) }),
        signal: controller.signal,
      });
      if (res.ok) return { reply: replyFromGroq(await res.json()) };
      const body = typeof res.text === 'function' ? await res.text().catch(() => '') : '';
      const wait = retryWaitMs(res.status, body);
      if (wait !== null) return { retryAfterMs: wait };
      throw new Error(`Groq respondió ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async turn({ system, messages, tools }) {
      const groqTools = tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } }));
      const payload = {
        messages: toGroqMessages(system, messages),
        temperature: GROQ.TEMPERATURE,
        max_tokens: GROQ.MAX_TOKENS,
        ...(groqTools.length ? { tools: groqTools, tool_choice: 'auto' } : {}),
      };
      let lastError: unknown = new Error('El asistente no respondió');
      for (const model of GROQ.MODELS) {
        for (let n = 1; n <= GROQ.ATTEMPTS_PER_MODEL; n++) {
          try {
            const r = await attempt(model, payload);
            if ('reply' in r) return r.reply;
            lastError = new Error('Groq pidió esperar');
            if (n < GROQ.ATTEMPTS_PER_MODEL) await sleep(r.retryAfterMs);
          } catch (err) {
            lastError = err;
            break;
          }
        }
      }
      throw lastError;
    },
  };
}

export function createRemotePlanner(deps: { api: Api }): Planner {
  return {
    async turn({ system, messages, tools }) {
      const body: PeticionTurnoAgenteDto = {
        sistema: system,
        mensajes: messages.map(toDto),
        herramientas: tools.map((t) => ({ nombre: t.name, descripcion: t.description, parametros: t.parameters })),
      };
      return replyFromDto(await deps.api.post<unknown>(RUTA_IA_AGENTE_TURNO, body));
    },
  };
}
