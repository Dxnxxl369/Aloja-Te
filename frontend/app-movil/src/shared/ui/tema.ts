// ======================================================================
// ARCHIVO: shared/ui/tema.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Colores, tipografías y espacios comunes (sistema "Andean Royal Hospitality": azul real, Playfair Display + Inter).
// PARA QUÉ SIRVE: Que todas las pantallas se vean iguales sin repetir valores.
// SIN ÉL: Colores sueltos en cada pantalla.
// NO VA AQUÍ: Componentes ni lógica.
// ======================================================================
// Valores tomados de DESIGN.md del flujo de pantallas (stitch_aloja_te_mobile_ui_flow).

export const COLOR = {
  primario: '#2563eb',
  primarioPresionado: '#1d4ed8',
  primarioSuave: '#eff6ff',
  primarioBorde: '#bfdbfe',
  fondo: '#f8fafc',
  tarjeta: '#ffffff',
  campo: '#f2f3ff', // relleno de los campos de texto
  texto: '#0f172a',
  textoSuave: '#64748b',
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
  scrim: 'rgba(15, 23, 42, 0.4)',
  /** Fondo de las etiquetas que van sobre una foto (ubicación, contador de fotos). */
  sobreFoto: 'rgba(15, 23, 42, 0.55)',
  /** Fondo de las píldoras blancas sobre una foto (calificación, "Verificado"). */
  sobreFotoClaro: 'rgba(255, 255, 255, 0.92)',
} as const;

/** Nombres de las fuentes cargadas en App.tsx (@expo-google-fonts). */
export const FUENTE = {
  titulo: 'PlayfairDisplay_600SemiBold',
  tituloFuerte: 'PlayfairDisplay_700Bold',
  normal: 'Inter_400Regular',
  medio: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  fuerte: 'Inter_700Bold',
} as const;

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
