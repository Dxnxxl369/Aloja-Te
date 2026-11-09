// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaDashboard.tsx
// QUÉ ES: Ruta que conecta la pantalla de Dashboard del anfitrión.
// ======================================================================

import React from 'react';
import { PantallaDashboard } from '../../../features/anfitrion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaDashboard({}: PropsTabAnfitrion<'Dashboard'>) {
  const { anfitrion } = useFeatures();

  return (
    <Marco titulo="Panel de Anfitrión">
      <PantallaDashboard repo={anfitrion} />
    </Marco>
  );
}
