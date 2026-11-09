// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaFinanzas.tsx
// QUÉ ES: Ruta que conecta la pantalla de Finanzas y Liquidaciones del anfitrión.
// ======================================================================

import React from 'react';
import { PantallaFinanzas } from '../../../features/anfitrion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaFinanzas({}: PropsTabAnfitrion<'Finanzas'>) {
  const { anfitrion } = useFeatures();

  return (
    <Marco titulo="Finanzas y Desembolsos">
      <PantallaFinanzas repo={anfitrion} />
    </Marco>
  );
}
