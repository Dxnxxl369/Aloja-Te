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
import { notificador } from '../core';
import type { CasosReservas } from '../features/reservas';
import { PREFIJO_AVISOS_RESERVA, planificarAvisos } from '../features/reservas/presentacion/planificarAvisos';

interface Props {
  navegacion: NavigationContainerRef<ParamListBase>;
  casos: CasosReservas;
  clienteId: string;
}

const ENTRE_SINCRONIZACIONES_MS = 5000;
/** Cuánto se espera a que la navegación esté lista si la app se abrió tocando un aviso. */
const ESPERA_NAVEGACION_MS = 5000;

export function AvisosReservas({ navegacion, casos, clienteId }: Props) {
  const ultima = useRef(0);

  const sincronizar = useCallback(async () => {
    const ahora = Date.now();
    if (ahora - ultima.current < ENTRE_SINCRONIZACIONES_MS) return;
    ultima.current = ahora;
    try {
      const reservas = await casos.listarReservasDeCliente(clienteId);
      await notificador.sincronizar(PREFIJO_AVISOS_RESERVA, planificarAvisos(reservas, Date.now(), casos.segundosRestantes));
    } catch {
      // Sin red o con error: quedan los avisos que ya había.
    }
  }, [casos, clienteId]);

  // Al abrir la app, al volver a ella y al cambiar de pantalla.
  useEffect(() => {
    void sincronizar();
    const alVolver = AppState.addEventListener('change', (e) => e === 'active' && void sincronizar());
    const alNavegar = navegacion.addListener('state', () => void sincronizar());
    return () => {
      alVolver.remove();
      alNavegar();
    };
  }, [navegacion, sincronizar]);

  // Al tocar un aviso se abre esa reserva.
  useEffect(() => {
    let vivo = true;
    const abrir = async (reservaId: string | undefined) => {
      if (!reservaId) return;
      const limite = Date.now() + ESPERA_NAVEGACION_MS;
      while (vivo && !navegacion.isReady() && Date.now() < limite) await new Promise((r) => setTimeout(r, 200));
      if (vivo && navegacion.isReady()) navegacion.navigate('Reserva', { reservaId });
    };
    const dejarDeEscuchar = notificador.alTocar((datos) => void abrir(datos.reservaId));
    void notificador.avisoQueAbrioLaApp().then((datos) => void abrir(datos?.reservaId)); // la app estaba cerrada
    return () => {
      vivo = false;
      dejarDeEscuchar();
    };
  }, [navegacion]);

  // Al cerrar sesión (o cambiar de usuario) no deben quedar avisos de reservas ajenas.
  useEffect(() => () => void notificador.sincronizar(PREFIJO_AVISOS_RESERVA, []), [clienteId]);

  return null;
}
