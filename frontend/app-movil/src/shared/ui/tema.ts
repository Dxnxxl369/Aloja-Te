// ======================================================================
// ARCHIVO: shared/ui/tema.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Colores, tipografía y espacios comunes (sistema "Andean Royal Hospitality": azul real, con Inter para todo el texto).
// PARA QUÉ SIRVE: Que todas las pantallas se vean iguales sin repetir valores.
// SIN ÉL: Colores sueltos en cada pantalla.
// NO VA AQUÍ: Componentes ni lógica.
// ======================================================================
// Valores tomados de DESIGN.md del flujo de pantallas (stitch_aloja_te_mobile_ui_flow).
// Excepción a propósito: DESIGN.md pide Playfair Display (títulos) + Inter; la app usa solo Inter (ver FUENTE).

export const COLOR = {
  primario: '#2563eb',
  primarioPresionado: '#1d4ed8',
  primarioSuave: '#eff6ff',
  primarioBorde: '#bfdbfe',
  fondo: '#f8fafc',
  tarjeta: '#ffffff',
  campo: '#f2f3ff', // relleno de los campos de texto
  texto: '#0f172a',
  // DESIGN.md dice #64748b; se oscureció un poco (#606f86) para llegar a 4.5:1 también sobre los fondos lilas y azul claro (WCAG AA).
  textoSuave: '#606f86',
  borde: '#e2e8f0',
  exito: '#16a34a',
  exitoFondo: '#f0fdf4',
  exitoBorde: '#bbf7d0',
  aviso: '#d97706',
  avisoFondo: '#fffbeb',
  avisoBorde: '#fde68a',
  error: '#dc2626',
  errorFondo: '#fef2f2',
  errorBorde: '#fecaca',
  // Tonos OSCUROS de verde, ámbar y rojo. Úsalos para TEXTO sobre fondos claros (cumplen 4.5:1) y para fondos con
  // texto blanco. Los tonos vivos de arriba (exito, aviso, error) quedan para iconos, puntos, barras y bordes.
  exitoOscuro: '#15803d',
  avisoOscuro: '#b45309',
  errorOscuro: '#b91c1c',
  scrim: 'rgba(15, 23, 42, 0.4)',
  /** Fondo de las etiquetas que van sobre una foto (ubicación, contador de fotos). */
  sobreFoto: 'rgba(15, 23, 42, 0.55)',
  /** Fondo de las píldoras blancas sobre una foto (calificación, "Verificado"). */
  sobreFotoClaro: 'rgba(255, 255, 255, 0.92)',
} as const;

/**
 * Tipografía: Inter para TODO el texto (títulos incluidos), una letra pensada para pantallas de celular.
 * Se incluye con la app (App.tsx la carga) en vez de usar la del sistema: en algunos Android (Xiaomi, por ejemplo)
 * la letra del sistema dibujaba mal las vocales con tilde ("Cu é ntame", "sesi ó n").
 * Cada token es un trozo de estilo: se usa con "...", por ejemplo `{ ...FUENTE.semi, fontSize: 15 }`.
 * Con una fuente por peso NO se pone `fontWeight` (el peso ya viene en el nombre). Para cambiar la letra de toda la
 * app basta con tocar este objeto y la carga de App.tsx.
 */
export const FUENTE = {
  // Los títulos grandes llevan un poco menos de espacio entre letras (DESIGN.md: -0.01em).
  titulo: { fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  tituloFuerte: { fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  normal: { fontFamily: 'Inter_400Regular' },
  medio: { fontFamily: 'Inter_500Medium' },
  semi: { fontFamily: 'Inter_600SemiBold' },
  fuerte: { fontFamily: 'Inter_700Bold' },
} as const;

/**
 * Tamaños de letra: una escala corta de 8 pasos en lugar de tamaños sueltos (antes había hasta 13 distintos).
 * Es una escala "ligera": el DESIGN.md propone 11, 12, 14, 16, 18, 22, 28, 32, pero en el celular se veía grande.
 * Referencias: Airbnb usa 14 en el título y el precio de sus tarjetas y 12 en lo secundario; Material 3 usa cuerpo 16/14
 * y título 22; nada debe bajar de 11 para que se lea. El usuario además puede agrandar la letra desde los ajustes del celular.
 * Se usa como `fontSize: TAMANO.cuerpo`.
 *   micro      11  etiquetas muy cortas (insignias, pestañas)
 *   pequeno    12  datos de apoyo (precio "/ noche", contadores)
 *   secundario 13  texto de apoyo y de botones pequeños
 *   cuerpo     15  texto principal, nombres en tarjetas, campos
 *   subtitulo  17  subtítulos
 *   titulo     20  títulos de sección
 *   titular    24  título de pantalla
 *   display    28  cifras o letras muy grandes
 */
export const TAMANO = { micro: 11, pequeno: 12, secundario: 13, cuerpo: 15, subtitulo: 17, titulo: 20, titular: 24, display: 28 } as const;

export const ESPACIO = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const RADIO = { control: 10, tarjeta: 12, pildora: 9999 } as const;

/** Sombra suave para controles flotantes (barra inferior, logo). */
export const SOMBRA_FLOTANTE = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.08,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
