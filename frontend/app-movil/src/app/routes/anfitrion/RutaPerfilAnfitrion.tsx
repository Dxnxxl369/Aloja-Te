// ======================================================================
// ARCHIVO: app/routes/anfitrion/RutaPerfilAnfitrion.tsx
// QUÉ ES: Ruta que conecta la pantalla de Perfil de Anfitrión.
// ======================================================================

import React from 'react';
import { Alert } from 'react-native';
import { useSesion } from '../../../core';
import { PantallaPerfilAnfitrion } from '../../../features/anfitrion';
import { useFeatures } from '../../features';
import { Marco } from '../../Marco';
import type { PropsTabAnfitrion } from '../../routeTypes';

export function RutaPerfilAnfitrion({}: PropsTabAnfitrion<'Perfil'>) {
  const { anfitrion } = useFeatures();
  const { cerrarSesion } = useSesion();

  const confirmarSalida = () =>
    Alert.alert('Cerrar sesión', '¿Deseas salir del panel de anfitrión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);

  return (
    <Marco titulo="Mi Perfil de Anfitrión">
      <PantallaPerfilAnfitrion repo={anfitrion} alCerrarSesion={confirmarSalida} />
    </Marco>
  );
}
