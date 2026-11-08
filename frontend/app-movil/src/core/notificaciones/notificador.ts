// ======================================================================
// ARCHIVO: core/notificaciones/notificador.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La implementación de Notificador con expo-notifications (avisos locales programados en el celular).
// PARA QUÉ SIRVE: Mostrar avisos como "tu reserva vence en 5 minutos" aunque la app esté cerrada.
// SIN ÉL: La app solo podría avisar mientras está abierta.
// NO VA AQUÍ: Cuándo avisar (es de cada feature). Es el ÚNICO archivo que importa expo-notifications.
// ======================================================================
// Son avisos LOCALES: los programa el propio celular. Las notificaciones push que manda un servidor ya no funcionan
// en Expo Go de Android (SDK 53+); harían falta una build propia y un servicio que las envíe.
// Nada aquí debe romper la app: cualquier fallo (sin permiso, sin soporte) se ignora con un aviso en consola.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { DatosAviso, Notificador } from './interfaces';
import type { AvisoLocal } from './modelos';

const CANAL = 'reservas';
/** Un aviso que cae dentro de estos milisegundos ya casi no tiene sentido programarlo. */
const MARGEN_MS = 5000;

let configurado = false;

/** Hace que los avisos también se vean con la app abierta (por defecto solo se ven con la app cerrada). */
function configurar(): void {
  if (configurado) return;
  configurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function tienePermiso(): Promise<boolean> {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  if (!actual.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** null = aún no se intentó; true/false = resultado de crear el canal "Reservas" (solo Android). */
let canalListo: boolean | null = null;

/**
 * Crea el canal "Reservas" de Android (agrupa los avisos y deja al usuario ajustarlos). Es opcional: en Expo Go de algunos
 * celulares falla, y entonces los avisos salen por el canal que Android crea por defecto, sin perder ninguno.
 */
async function prepararCanal(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  if (canalListo !== null) return canalListo;
  try {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Reservas',
      importance: Notifications.AndroidImportance.HIGH,
    });
    canalListo = true;
  } catch (e) {
    console.warn('No se pudo crear el canal de avisos; se usará el de por defecto:', e instanceof Error ? e.message.split('\n')[0] : e);
    canalListo = false;
  }
  return canalListo;
}

function comoDatos(valor: unknown): DatosAviso {
  const datos: DatosAviso = {};
  if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) if (typeof v === 'string') datos[k] = v;
  }
  return datos;
}

export function crearNotificador(): Notificador {
  // Las sincronizaciones se hacen de una en una: dos a la vez podrían programar el mismo aviso dos veces.
  let cola: Promise<void> = Promise.resolve();

  async function sincronizarAhora(prefijo: string, avisos: AvisoLocal[]): Promise<void> {
    const deseados = avisos.filter((a) => a.cuando > Date.now() + MARGEN_MS);
    const programadas = (await Notifications.getAllScheduledNotificationsAsync()).filter((p) => p.identifier.startsWith(prefijo));

    for (const p of programadas) {
      if (!deseados.some((a) => a.id === p.identifier)) await Notifications.cancelScheduledNotificationAsync(p.identifier);
    }

    const faltan = deseados.filter((a) => !programadas.some((p) => p.identifier === a.id));
    if (faltan.length === 0) return;
    // El permiso solo se pide cuando de verdad hay algo que avisar.
    if (!(await tienePermiso())) return;
    const conCanal = await prepararCanal();

    for (const a of faltan) {
      await Notifications.scheduleNotificationAsync({
        identifier: a.id,
        content: { title: a.titulo, body: a.cuerpo, data: a.datos },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(a.cuando),
          ...(conCanal ? { channelId: CANAL } : {}),
        },
      });
    }
  }

  return {
    sincronizar(prefijo, avisos) {
      configurar();
      cola = cola.then(() =>
        sincronizarAhora(prefijo, avisos).catch((e: unknown) => {
          console.warn('No se pudieron programar los avisos:', e instanceof Error ? e.message : e);
        }),
      );
      return cola;
    },

    alTocar(escuchador) {
      configurar();
      const suscripcion = Notifications.addNotificationResponseReceivedListener((r) =>
        escuchador(comoDatos(r.notification.request.content.data)),
      );
      return () => suscripcion.remove();
    },

    async avisoQueAbrioLaApp() {
      try {
        const r = await Notifications.getLastNotificationResponseAsync();
        return r ? comoDatos(r.notification.request.content.data) : null;
      } catch {
        return null;
      }
    },
  };
}

/** El notificador de la app. */
export const notificador: Notificador = crearNotificador();
