// ======================================================================
// ARCHIVO: auth/SesionProvider.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El puente entre auth y las pantallas.
// PARA QUÉ SIRVE: Con useSesion() cualquier pantalla sabe si hay usuario y puede cerrar sesión.
// SIN ÉL: Funcionaría, pero cada pantalla tendría que consultar auth a mano.
// NO VA AQUÍ: Lógica de login. Eso vive en auth.ts.
// ======================================================================
// Contexto React con la sesión. Se monta una vez en la raíz de la app:
//   <SesionProvider auth={auth}> ... </SesionProvider>

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ServicioAuth } from './interfaces';
import type { Sesion } from './modelos';

interface ValorSesion {
  sesion: Sesion | null;
  cargando: boolean;
  iniciarSesion(email: string, password: string): Promise<void>;
  cerrarSesion(): Promise<void>;
}

const Contexto = createContext<ValorSesion | null>(null);

export function SesionProvider({ auth, children }: { auth: ServicioAuth; children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    auth
      .sesionActual()
      .then((s) => vivo && setSesion(s))
      .finally(() => vivo && setCargando(false));
    const quitar = auth.alExpirar(() => setSesion(null));
    return () => {
      vivo = false;
      quitar();
    };
  }, [auth]);

  const iniciarSesion = useCallback(
    async (email: string, password: string) => setSesion(await auth.iniciarSesion(email, password)),
    [auth],
  );
  const cerrarSesion = useCallback(async () => {
    await auth.cerrarSesion();
    setSesion(null);
  }, [auth]);

  const valor = useMemo(
    () => ({ sesion, cargando, iniciarSesion, cerrarSesion }),
    [sesion, cargando, iniciarSesion, cerrarSesion],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ValorSesion {
  const v = useContext(Contexto);
  if (!v) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return v;
}
