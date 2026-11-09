// ======================================================================
// ARCHIVO: ia/presentacion/texts.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estados de la pantalla "Agente inteligente" y la etiqueta (texto y color) de cada uno.
// PARA QUÉ SIRVE: Tener las frases en un solo lugar, fuera del código de la pantalla.
// SIN ÉL: Las frases estarían dentro de PantallaModeloIa.
// NO VA AQUÍ: Números ni reglas ni lógica.
// ======================================================================
// Escritos para el usuario final: sin palabras técnicas.

import type { Tono } from '../../../shared/ui/Insignia';

export type EstadoModeloIa = 'NO_SOPORTADO' | 'NO_DESCARGADO' | 'DESCARGANDO' | 'LISTO' | 'CARGADO' | 'ERROR';

export const TEXTO: Record<EstadoModeloIa, { etiqueta: string; tono: Tono }> = {
  NO_SOPORTADO: { etiqueta: 'No disponible en este celular', tono: 'neutro' },
  NO_DESCARGADO: { etiqueta: 'Sin descargar', tono: 'aviso' },
  DESCARGANDO: { etiqueta: 'Descargando…', tono: 'primario' },
  LISTO: { etiqueta: 'Descargado', tono: 'primario' },
  CARGADO: { etiqueta: 'Funcionando', tono: 'exito' },
  ERROR: { etiqueta: 'Hubo un problema', tono: 'error' },
};

/** Los mensajes de la pantalla cuando algo sale mal y el aviso antes de borrar. El detalle técnico del error nunca se le muestra al usuario. */
export const IA_MESSAGES = {
  DOWNLOAD_FAILED: 'No se pudo descargar. Revisa tu conexión y que tengas espacio libre, e inténtalo otra vez.',
  ACTIVATE_FAILED: 'No se pudo activar en este celular por ahora. El agente seguirá funcionando con frases simples.',
  DELETE_FAILED: 'No se pudo borrar. Inténtalo otra vez.',
  DELETE_TITLE: 'Borrar el agente inteligente',
  DELETE_BODY: 'Se libera el espacio y el agente seguirá funcionando con frases simples. Podrás descargarlo de nuevo.',
  CANCEL: 'Cancelar',
  DELETE: 'Borrar',
} as const;
