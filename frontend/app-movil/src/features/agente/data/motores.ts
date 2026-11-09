// ======================================================================
// ARCHIVO: agente/data/motores.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Las formas de ENTENDER un mensaje en el MODO BÁSICO (cuando la IA de la nube que planea con herramientas no responde): IA local en el celular y reglas simples. Más el compuesto que elige la mejor disponible.
// PARA QUÉ SIRVE: El agente nunca se queda mudo: modelo local si está cargado y, si no, las reglas (sin red ni modelo).
// SIN ÉL: Sin internet y sin IA de la nube, el agente no entendería nada.
// NO VA AQUÍ: Decidir qué hacer con lo entendido (eso es el plan) ni la IA de la nube (eso es planner.ts).
// ======================================================================
// Todos devuelven solo DATOS (Intencion). Ninguno ejecuta acciones.

import type { ModeloLocal } from '../../../core';
import { CIUDADES, DIA_MS, ESQUEMA_INTENCION, MESES, NUMEROS_EN_PALABRAS, OFFSET_BOLIVIA_MS, PROMPT_INTENCION } from '../constantes';
import { normalizar } from '../domain/plan';
import type { MotorLenguaje } from '../domain/interfaces';
import type { Criterios, Intencion } from '../domain/modelos';
import { intencionDesdeObjeto, intencionDesdeTexto } from './mapeadores';

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const tieneDatos = (i: Intencion) => Object.values(i).some((v) => v !== undefined);

/** `ahora` en horario de Bolivia -> 'YYYY-MM-DD'. */
function hoyIso(ahora: () => number): string {
  return iso(ahora() + OFFSET_BOLIVIA_MS);
}

// --- 1) Reglas: siempre disponible, sin red ni modelo ------------------------

export function crearMotorReglas(deps: { ahora?: () => number } = {}): MotorLenguaje {
  const ahora = deps.ahora ?? Date.now;

  return {
    async extraerIntencion(texto) {
      const t = normalizar(texto);
      const hoy = hoyIso(ahora);
      const hoyMs = Date.parse(`${hoy}T00:00:00Z`);
      const out: Criterios = {};

      // Ciudad: solo las conocidas (evita confundir "en diciembre" con una ciudad).
      const ciudad = CIUDADES.find((c) => new RegExp(`\\b${normalizar(c)}\\b`).test(t));
      if (ciudad) out.ciudad = ciudad;

      // Huéspedes: "2 personas", "dos huespedes".
      const hp = t.match(/\b(\d{1,2}|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:personas?|huespedes?|adultos?)\b/);
      if (hp?.[1]) out.huespedes = /^\d+$/.test(hp[1]) ? Number(hp[1]) : (NUMEROS_EN_PALABRAS[hp[1]] ?? undefined);

      // Presupuesto: "hasta 300 bs", "300 bolivianos".
      const pr = t.match(/\b(\d{2,5})\s*(?:bs|bob|bolivianos?)\b/);
      if (pr?.[1]) out.presupuestoMaxNoche = Number(pr[1]);

      // Fechas, de la más explícita a la más vaga.
      const isos = texto.match(/\d{4}-\d{2}-\d{2}/g);
      const rango = t.match(new RegExp(`\\bdel?\\s+(\\d{1,2})\\s+al\\s+(\\d{1,2})\\s+de\\s+(${MESES.join('|')})\\b`));
      const barras = [...texto.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g)];
      const anioActual = Number(hoy.slice(0, 4));

      const armar = (anio: number, mes: number, dia: number) =>
        `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      if (isos && isos[0]) {
        out.checkIn = isos[0];
        if (isos[1]) out.checkOut = isos[1];
      } else if (rango?.[1] && rango[2] && rango[3]) {
        const mes = MESES.indexOf(rango[3] as (typeof MESES)[number]) + 1;
        let anio = anioActual;
        if (Date.parse(`${armar(anio, mes, Number(rango[1]))}T00:00:00Z`) < hoyMs) anio += 1; // ese mes ya pasó: el próximo año
        out.checkIn = armar(anio, mes, Number(rango[1]));
        out.checkOut = armar(anio, mes, Number(rango[2]));
      } else if (barras.length > 0 && barras[0]) {
        const f = (m: RegExpMatchArray) => armar(m[3] ? Number(m[3]) : anioActual, Number(m[2]), Number(m[1]));
        out.checkIn = f(barras[0]);
        if (barras[1]) out.checkOut = f(barras[1]);
      } else if (/\bpasado manana\b/.test(t)) out.checkIn = iso(hoyMs + 2 * DIA_MS);
      else if (/\bmanana\b/.test(t)) out.checkIn = iso(hoyMs + DIA_MS);
      else if (/\bhoy\b/.test(t)) out.checkIn = iso(hoyMs);

      // "por 3 noches": la salida se calcula desde la entrada (la nueva o ninguna).
      const noches = t.match(/\b(\d{1,2})\s+noches?\b/);
      if (noches?.[1] && out.checkIn && !out.checkOut) out.checkOut = iso(Date.parse(`${out.checkIn}T00:00:00Z`) + Number(noches[1]) * DIA_MS);

      return intencionDesdeObjeto(out); // misma validación que las demás fuentes
    },
  };
}

// --- 2) IA local: el modelo corre en el celular ------------------------------

export function crearMotorLocal(deps: { modelo: ModeloLocal; ahora?: () => number }): MotorLenguaje & { listo(): boolean } {
  const { modelo } = deps;
  const ahora = deps.ahora ?? Date.now;
  return {
    listo: () => modelo.estado() === 'CARGADO',
    async extraerIntencion(texto, actuales) {
      const prompt =
        `${PROMPT_INTENCION.replace('{HOY}', hoyIso(ahora))}\n` +
        `Datos ya conocidos: ${JSON.stringify(actuales)}\nMensaje: ${texto}\nJSON:`;
      return intencionDesdeTexto(await modelo.generar(prompt, { esquemaJson: ESQUEMA_INTENCION }));
    },
  };
}

// --- 3) Compuesto: local (si está cargado) -> reglas --------------------------

export function crearMotorCompuesto(deps: { reglas: MotorLenguaje; local?: MotorLenguaje & { listo(): boolean } }): MotorLenguaje {
  const { reglas, local } = deps;
  return {
    async extraerIntencion(texto, actuales) {
      if (local?.listo()) {
        try {
          const r = await local.extraerIntencion(texto, actuales);
          if (tieneDatos(r)) return r; // si no encontró nada, las reglas lo intentan
        } catch (e) {
          console.warn('La IA local falló, uso las reglas', e instanceof Error ? e.message : e);
        }
      }
      return reglas.extraerIntencion(texto, actuales);
    },
  };
}
