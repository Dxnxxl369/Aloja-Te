// ======================================================================
// ARCHIVO: app/routeTypes.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Los tipos de las rutas: qué pantallas existen y qué datos recibe cada una al abrirse.
// PARA QUÉ SIRVE: Que cada ruta (app/routes/) y el armado de la navegación compartan una sola lista, y TypeScript avise si se abre una pantalla con datos incorrectos.
// SIN ÉL: Los tipos estarían dentro de navegacion.tsx, mezclados con las pantallas.
// NO VA AQUÍ: Pantallas ni lógica: solo tipos.
// ======================================================================
// Dos niveles: las 3 pestañas (RutasTabs) y la pila de encima (RutasRaiz), que incluye las pestañas como una sola pantalla ("Tabs").

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ContextoAlojamiento } from '../features/agente';
import type { SolicitudPago } from '../features/pagos';
import type { DatosTarjetaAlojamiento } from '../shared/ui/TarjetaAlojamiento';

export type RutasTabs = {
  Explorar: undefined;
  /** `alojamiento`: llegó desde la ficha de un alojamiento; `inicio` distingue cada llegada (reinicia la conversación). */
  Agente: { alojamiento?: ContextoAlojamiento; inicio?: number } | undefined;
  Perfil: undefined;
};

export type RutasRaiz = {
  Tabs: NavigatorScreenParams<RutasTabs> | undefined;
  /** Las reservas del usuario: se abre desde Perfil. */
  MisReservas: undefined;
  Detalle: { datos: DatosTarjetaAlojamiento };
  ReservaManual: { alojamientoId: string; titulo: string };
  ModeloIa: undefined;
  Reserva: { reservaId: string; pagoRecibido?: boolean };
  Pago: { solicitud: SolicitudPago };
};

/** Pantalla de una pestaña: puede navegar a las otras pestañas y a las pantallas de encima. */
export type PropsTab<R extends keyof RutasTabs> = CompositeScreenProps<
  BottomTabScreenProps<RutasTabs, R>,
  NativeStackScreenProps<RutasRaiz>
>;

/** Pantalla de la pila de encima de las pestañas. */
export type PropsRaiz<R extends keyof RutasRaiz> = NativeStackScreenProps<RutasRaiz, R>;
