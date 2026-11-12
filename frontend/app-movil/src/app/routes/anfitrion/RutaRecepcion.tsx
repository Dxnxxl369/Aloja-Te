// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaRecepcion.tsx
// QUÉ ES: Conexión de la pantalla de Recepción y Control de PIN con el repositorio del Anfitrión.
// ======================================================================

import React from 'react';
import { PantallaRecepcion } from '../../../features/anfitrion/presentacion/pantallas/PantallaRecepcion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaRecepcion({ route }: PropsTabAnfitrion<'Recepcion'>) {
  const { anfitrion } = useFeatures();
  const params = route?.params;

  return (
    <Marco titulo="Recepción & PIN">
      <PantallaRecepcion
        repo={anfitrion}
        filtroPropiedad={params?.propiedadTitulo}
        filtroAlojamientoId={params?.alojamientoId}
        reservaIdDestacada={params?.reservaId}
        pinInicial={params?.pin}
      />
    </Marco>
  );
}
