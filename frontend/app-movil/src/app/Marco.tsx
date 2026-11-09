// ======================================================================
// ARCHIVO: app/Marco.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: El marco común de cada pantalla de la sesión: la cabecera, la franja de "sin internet / pendientes" y el contenido.
// PARA QUÉ SIRVE: Que todas las pantallas tengan la misma cabecera y avisen igual cuando no hay conexión.
// SIN ÉL: Cada ruta armaría su propia cabecera y su propio aviso.
// NO VA AQUÍ: Qué pantalla se muestra ni cómo se navega (son las rutas).
// ======================================================================

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useEstadoSync } from '../core';
import { AvisoSinRed } from '../shared/ui/AvisoSinRed';
import { Encabezado } from '../shared/ui/Encabezado';
import { COLOR } from '../shared/ui/tema';

interface Props {
  titulo?: string;
  /** Cabecera de la pantalla de inicio: el logo y "Aloja-Te" en lugar del título. */
  marca?: boolean;
  alVolver?: () => void;
  alCompartir?: () => void;
  /** Algo propio de la pantalla a la derecha del título. */
  derecha?: ReactNode;
  children: ReactNode;
}

/** Cabecera + aviso de conexión + el contenido de la pantalla. */
export function Marco({ titulo, marca, alVolver, alCompartir, derecha, children }: Props) {
  const sync = useEstadoSync();
  return (
    <View style={{ flex: 1, backgroundColor: COLOR.fondo }}>
      <Encabezado titulo={titulo} marca={marca} alVolver={alVolver} alCompartir={alCompartir} derecha={derecha} />
      <AvisoSinRed conectado={sync.conectado} pendientes={sync.pendientes} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
