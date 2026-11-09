// ======================================================================
// ARCHIVO: shared/ui/fechas.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Pequeñas funciones para fechas en texto "YYYY-MM-DD": convertir, sumar días y escribirlas en español.
// PARA QUÉ SIRVE: Los selectores de fecha usan `Date`, pero la app guarda y envía las fechas como texto.
// SIN ÉL: Cada pantalla repetiría estas cuentas (y se equivocaría con los husos horarios).
// NO VA AQUÍ: Reglas de reserva (fechas pasadas, máximo de noches): eso es de reservas/domain.
// ======================================================================
// Todo se hace con las partes LOCALES de la fecha (año, mes, día) para que "2026-12-12" nunca se corra
// a otro día por el huso horario del celular.

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

const FORMATO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** 'YYYY-MM-DD' -> Date a medianoche local. null si no es una fecha real (ej. 2026-02-30). */
export function aFecha(texto: string): Date | null {
  const m = FORMATO.exec(texto);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(anio, mes - 1, dia);
  return f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia ? f : null;
}

/** Date -> 'YYYY-MM-DD' con el año, mes y día locales. */
export function aTexto(fecha: Date): string {
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}

/** Hoy según el reloj del celular. */
export function hoyTexto(): string {
  return aTexto(new Date());
}

/** Suma (o resta) días a una fecha en texto. null si la fecha de partida no es válida. */
export function sumarDias(texto: string, dias: number): string | null {
  const f = aFecha(texto);
  if (!f) return null;
  f.setDate(f.getDate() + dias);
  return aTexto(f);
}

/**
 * "12 dic → 15 dic 2026"; si la estadía cruza de año, "28 dic 2026 → 2 ene 2027".
 * Si alguna de las dos no es una fecha válida, devuelve los textos tal cual.
 */
export function formatearRango(entrada: string, salida: string): string {
  const a = aFecha(entrada);
  const b = aFecha(salida);
  if (!a || !b) return `${entrada} → ${salida}`;
  const corta = (f: Date) => `${f.getDate()} ${MESES[f.getMonth()]}`;
  return a.getFullYear() === b.getFullYear()
    ? `${corta(a)} → ${corta(b)} ${b.getFullYear()}`
    : `${corta(a)} ${a.getFullYear()} → ${corta(b)} ${b.getFullYear()}`;
}

/** "sáb 12 dic 2026". Si no es una fecha válida, devuelve el texto tal cual. */
export function formatearFecha(texto: string): string {
  const f = aFecha(texto);
  if (!f) return texto;
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
}
