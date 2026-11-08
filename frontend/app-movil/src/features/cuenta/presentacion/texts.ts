// ======================================================================
// ARCHIVO: cuenta/presentacion/texts.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los textos del perfil que dependen de un estado: qué dice la fila del agente inteligente y cómo se llama cada tipo de cuenta.
// PARA QUÉ SIRVE: Tener las frases en un solo lugar, fuera del código de la pantalla.
// SIN ÉL: Las frases estarían dentro de PantallaPerfil.
// NO VA AQUÍ: Números ni reglas ni lógica.
// ======================================================================
// Escritos para el usuario final: sin palabras técnicas.

import type { EstadoModelo } from '../../../core';

/** Lo que dice la fila "Agente inteligente" del perfil según su estado. */
export const TEXTO_IA: Record<EstadoModelo, string> = {
  CARGADO: 'Funcionando en tu celular',
  LISTO: 'Descargado: se activa al abrir el agente',
  DESCARGANDO: 'Descargando…',
  NO_DESCARGADO: 'Sin descargar: el agente entiende frases simples',
  NO_SOPORTADO: 'No disponible en este celular',
  ERROR: 'Hubo un problema: toca para revisar',
};

/** Cómo se llama cada tipo de cuenta (el servidor manda CLIENTE, ANFITRION, ADMINISTRADOR). */
export const TEXTO_ROL: Record<string, string> = { CLIENTE: 'Huésped', ANFITRION: 'Anfitrión', ADMINISTRADOR: 'Administrador' };
