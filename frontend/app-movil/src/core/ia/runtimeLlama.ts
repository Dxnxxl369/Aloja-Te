// ======================================================================
// ARCHIVO: ia/runtimeLlama.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El motor que hace funcionar el modelo GGUF dentro del celular (usa la librería llama.rn).
// PARA QUÉ SIRVE: Convierte un texto en la respuesta del modelo, sin internet. Es la ÚNICA pieza que conoce llama.rn.
// SIN ÉL: El modelo descargado no se puede usar: la IA local no funciona y solo quedan la nube y las reglas.
// NO VA AQUÍ: Descargar el archivo, verificar el hash o decidir cuándo cargar (eso es modeloLocal.ts), ni saber qué es una reserva.
// ======================================================================
// Detalles que importan:
//  - La librería se carga con import() dinámico: no se toca el código nativo hasta que el usuario
//    abre el agente (arranque más rápido) y las pruebas en la PC no necesitan el módulo nativo.
//  - Un solo contexto atiende una petición a la vez: las llamadas se ponen en fila.
//  - Con `esquemaJson` el modelo solo puede producir JSON con esa forma (llama.rn lo convierte a
//    gramática GBNF). Aun así, el feature valida cada campo: el esquema asegura la forma, no la verdad.
//  - `enable_thinking: false`: respuesta directa, sin razonar en voz alta (más rápido y corto).

import { AppError } from '../base/modelos';
import type { RuntimeIA } from './interfaces';
import type { ConfigRuntime, OpcionesGeneracion } from './modelos';

type Libreria = typeof import('llama.rn');
type Contexto = Awaited<ReturnType<Libreria['initLlama']>>;

export function crearRuntimeLlama(deps: {
  config: ConfigRuntime;
  /** Solo para pruebas: entregar una librería simulada. Por defecto se importa llama.rn. */
  cargarLibreria?: () => Promise<Libreria>;
}): RuntimeIA {
  const { config } = deps;
  const cargarLibreria = deps.cargarLibreria ?? (() => import('llama.rn'));

  let contexto: Contexto | null = null;
  let fila: Promise<unknown> = Promise.resolve(); // cola de peticiones

  /** Ejecuta `tarea` cuando termine la anterior; un fallo no bloquea la fila. */
  function enFila<T>(tarea: () => Promise<T>): Promise<T> {
    const siguiente = fila.then(tarea, tarea);
    fila = siguiente.catch(() => undefined);
    return siguiente;
  }

  return {
    async cargar(rutaArchivo) {
      if (contexto) return; // ya está en memoria
      try {
        const { initLlama } = await cargarLibreria();
        contexto = await initLlama({
          model: rutaArchivo,
          n_ctx: config.contextoTokens,
          n_gpu_layers: config.capasGpu,
          use_mlock: false, // no fijar la RAM: en gama baja el sistema debe poder recuperarla
        });
      } catch (e) {
        contexto = null;
        throw new AppError('DESCONOCIDO', `No se pudo cargar el modelo local: ${e instanceof Error ? e.message : String(e)}`);
      }
    },

    generar(prompt, opciones?: OpcionesGeneracion) {
      return enFila(async () => {
        if (!contexto) throw new AppError('DESCONOCIDO', 'El motor de IA local no está cargado');
        const resultado = await contexto.completion({
          messages: [{ role: 'user', content: prompt }],
          n_predict: opciones?.maxTokens ?? config.maxTokensRespuesta,
          temperature: config.temperatura,
          chat_template_kwargs: { enable_thinking: false },
          ...(opciones?.esquemaJson
            ? { response_format: { type: 'json_schema' as const, json_schema: { strict: true, schema: opciones.esquemaJson } } }
            : {}),
        });
        return resultado.text;
      });
    },

    async liberar() {
      await enFila(async () => {
        const c = contexto;
        contexto = null;
        if (c) await c.release();
      });
    },
  };
}
