// ======================================================================
// ARCHIVO: app/AvisosReservas.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Un componente invisible que mantiene al día los avisos (notificaciones) de las reservas del usuario y abre la reserva al tocar uno.
// PARA QUÉ SIRVE: Que el usuario reciba "tu reserva vence en 5 minutos" o "mañana es tu check-in" sin tener la app abierta.
// SIN ÉL: Una reserva pendiente solo se vería al abrir Perfil → Mis reservas.
// NO VA AQUÍ: Qué avisar y cuándo (es reservas/presentacion/planificarAvisos.ts) ni cómo se programan (es core/notificaciones).
// ======================================================================
// Pone la lista de avisos al día al abrir la app, al volver a ella y al moverse entre pantallas (cada 5 segundos como mucho).
// Si no hay internet se quedan los avisos que ya estaban programados. Al cerrar sesión se cancelan todos.

import type { NavigationContainerRef, ParamListBase } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { notificador, notificarReservaAnfitrion, registrarFirebaseToken } from '../core';
import { API_URL } from '../core/base/constantes';
import type { CasosReservas } from '../features/reservas';
import type { RepositorioAnfitrion } from '../features/anfitrion';
import { PREFIJO_AVISOS_RESERVA, planificarAvisos } from '../features/reservas/presentacion/planificarAvisos';

interface Props {
  navegacion: NavigationContainerRef<ParamListBase>;
  casos: CasosReservas;
  anfitrionRepo?: RepositorioAnfitrion;
  clienteId: string;
  rol?: string;
}

const ENTRE_SINCRONIZACIONES_MS = 5000;
/** Cuánto se espera a que la navegación esté lista si la app se abrió tocando un aviso. */
const ESPERA_NAVEGACION_MS = 5000;

export function AvisosReservas({ navegacion, casos, anfitrionRepo, clienteId, rol }: Props) {
  const ultima = useRef(0);
  const reservasVistasRef = useRef<Set<string>>(new Set());
  const inicioCompletadoRef = useRef(false);

  const sincronizar = useCallback(async () => {
    const ahora = Date.now();
    if (ahora - ultima.current < ENTRE_SINCRONIZACIONES_MS) return;
    ultima.current = ahora;

    // 1. Si el usuario actual es ANFITRIÓN: monitorear reservas de sus propiedades
    if (rol === 'ANFITRION' && anfitrionRepo) {
      try {
        const dashboard = await anfitrionRepo.obtenerDashboard(clienteId);
        const recientes = dashboard.reservasRecientes || [];

        for (const r of recientes) {
          if (!reservasVistasRef.current.has(r.id)) {
            reservasVistasRef.current.add(r.id);
            // Si ya pasó la primera carga inicial del arranque y entra una reserva:
            if (inicioCompletadoRef.current) {
              await notificarReservaAnfitrion({
                propiedadTitulo: r.alojamientoTitulo,
                alojamientoId: r.alojamientoId,
                reservaId: r.id,
                huespedNombre: r.huespedNombre,
                checkIn: r.checkIn,
                checkOut: r.checkOut,
                pin: r.codigoCheckin,
              });
            }
          }
        }
        inicioCompletadoRef.current = true;
      } catch {
        // En caso de fallo de red
      }
      return;
    }

    // 2. Si el usuario actual es CLIENTE: programar avisos locales de vencimiento de pago
    try {
      const reservas = await casos.listarReservasDeCliente(clienteId);
      await notificador.sincronizar(PREFIJO_AVISOS_RESERVA, planificarAvisos(reservas, Date.now(), casos.segundosRestantes));
    } catch {
      // Sin red o con error: quedan los avisos que ya había.
    }
  }, [casos, anfitrionRepo, clienteId, rol]);

  // Registro automático de token push contra el API Gateway para el anfitrión
  useEffect(() => {
    if (rol === 'ANFITRION') {
      void registrarFirebaseToken(API_URL, clienteId);
    }
  }, [rol, clienteId]);

  // Al abrir la app, al volver a ella, al cambiar de pantalla y por sondeo periódico (cada 7s).
  useEffect(() => {
    void sincronizar();
    const interval = setInterval(() => void sincronizar(), 7000);
    const alVolver = AppState.addEventListener('change', (e) => e === 'active' && void sincronizar());
    const alNavegar = navegacion.addListener('state', () => void sincronizar());
    return () => {
      clearInterval(interval);
      alVolver.remove();
      alNavegar();
    };
  }, [navegacion, sincronizar]);

  // Al tocar un aviso (notificación push o local):
  useEffect(() => {
    let vivo = true;
    const abrir = async (datos: Record<string, string> | null | undefined) => {
      if (!datos) return;
      const limite = Date.now() + ESPERA_NAVEGACION_MS;
      while (vivo && !navegacion.isReady() && Date.now() < limite) await new Promise((r) => setTimeout(r, 200));
      if (!vivo || !navegacion.isReady()) return;

      // A) Notificación para el ANFITRIÓN:
      // Redirige a la pantalla de Recepción & PIN con la información de la propiedad y cola de reservas
      if (datos.tipo === 'RESERVA_ANFITRION' || datos.propiedadTitulo) {
        (navegacion as any).navigate('Tabs', {
          screen: 'Recepcion',
          params: {
            propiedadTitulo: datos.propiedadTitulo,
            alojamientoId: datos.alojamientoId,
            reservaId: datos.reservaId,
            pin: datos.pin,
          },
        });
        return;
      }

      // B) Notificación para el CLIENTE:
      if (datos.reservaId) {
        (navegacion as any).navigate('Reserva', { reservaId: datos.reservaId });
      }
    };

    const dejarDeEscuchar = notificador.alTocar((datos) => void abrir(datos));
    void notificador.avisoQueAbrioLaApp().then((datos) => void abrir(datos)); // Si la app estaba cerrada
    return () => {
      vivo = false;
      dejarDeEscuchar();
    };
  }, [navegacion]);

  // Al cerrar sesión (o cambiar de usuario) no deben quedar avisos de reservas ajenas.
  useEffect(() => () => void notificador.sincronizar(PREFIJO_AVISOS_RESERVA, []), [clienteId]);

  return null;
}
