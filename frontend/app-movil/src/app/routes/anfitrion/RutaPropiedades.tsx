// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaPropiedades.tsx
// QUÉ ES: Ruta que conecta la lista de alojamientos / propiedades del anfitrión.
// ======================================================================

import React from 'react';
import { PantallaPropiedades } from '../../../features/anfitrion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaPropiedades({}: PropsTabAnfitrion<'Propiedades'>) {
  const { anfitrion } = useFeatures();

  return (
    <Marco titulo="Mis Alojamientos">
      <PantallaPropiedades repo={anfitrion} />
    </Marco>
  );
}
