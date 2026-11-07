// ======================================================================
// ARCHIVO: agente/presentacion/useAgente.ts      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El hook que guarda el estado del agente y evita que se dispare una acción mientras otra está en curso.
// PARA QUÉ SIRVE: La pantalla solo pinta y manda eventos; no sabe del plan.
// SIN ÉL: Un doble toque en "Confirmar" podría crear dos reservas.
// NO VA AQUÍ: Reglas del plan (están en domain/casos.ts).
// ======================================================================

import { useCallback, useRef, useState } from 'react';
import type { CasosAgente } from '../domain/interfaces';
import type { EstadoAgente } from '../domain/modelos';

export function useAgente(casos: CasosAgente) {
  const [estado, setEstadoReact] = useState<EstadoAgente>(() => casos.iniciar());
  const [ocupado, setOcupado] = useState(false);
  const actual = useRef(estado); // el estado más reciente, sin esperar al render
  const bloqueo = useRef(false); // corta el doble toque

  const poner = useCallback((e: EstadoAgente) => {
    actual.current = e;
    setEstadoReact(e);
  }, []);

  const ejecutar = useCallback(
    async (accion: (e: EstadoAgente) => Promise<EstadoAgente>) => {
      if (bloqueo.current) return;
      bloqueo.current = true;
      setOcupado(true);
      try {
        poner(await accion(actual.current));
      } finally {
        bloqueo.current = false;
        setOcupado(false);
      }
    },
    [poner],
  );

  return {
    estado,
    ocupado,
    enviar: (texto: string) => ejecutar((e) => casos.enviarMensaje(e, texto)),
    elegir: (i: number) => ejecutar((e) => casos.elegirOpcion(e, i)),
    confirmar: () => ejecutar((e) => casos.confirmar(e)),
    rechazar: () => ejecutar(async (e) => casos.rechazar(e)),
    reiniciar: () => poner(casos.iniciar()),
  };
}
