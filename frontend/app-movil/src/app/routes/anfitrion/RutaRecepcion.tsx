// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaRecepcion.tsx
// QUÉ ES: Conexión de la pantalla de Recepción y Control de PIN con el repositorio del Anfitrión.
// ======================================================================

import React from 'react';
import { PantallaRecepcion } from '../../../features/anfitrion/presentacion/pantallas/PantallaRecepcion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaRecepcion({}: PropsTabAnfitrion<'Recepcion'>) {
  const { anfitrion } = useFeatures();

  return (
    <Marco titulo="Recepción & PIN">
      <PantallaRecepcion repo={anfitrion} />
    </Marco>
  );
}
