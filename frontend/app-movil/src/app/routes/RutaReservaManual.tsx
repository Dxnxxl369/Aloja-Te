// ======================================================================
// ARCHIVO: app/routes/RutaReservaManual.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La conexión de "Reservar a mano": carga las habitaciones del alojamiento y entrega la pantalla con la sesión y las reglas de reservas.
// PARA QUÉ SIRVE: Que la pantalla reciba todo listo y que, si las habitaciones tardan o fallan, el usuario vea un aviso con "Reintentar".
// SIN ÉL: La pantalla de reservar a mano no tendría de dónde sacar las habitaciones.
// NO VA AQUÍ: Dibujo (es PantallaReservaManual) ni reglas de reservas.
// ======================================================================

import { ActivityIndicator, Text, View } from 'react-native';
import { useSesion } from '../../core';
import { useDetalle } from '../../features/catalogo';
import { PantallaReservaManual } from '../../features/reservas';
import { Boton } from '../../shared/ui/Boton';
import { COLOR } from '../../shared/ui/tema';
import { COMMON_TEXT } from '../../shared/ui/texts';
import { useFeatures } from '../features';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';
import { estilos } from './RutaReservaManual.styles';

export function RutaReservaManual({ navigation, route }: PropsRaiz<'ReservaManual'>) {
  const { catalogo, reservas } = useFeatures();
  const { sesion } = useSesion();
  const { alojamientoId, titulo } = route.params;
  const { detalle, cargando, error, recargar } = useDetalle(catalogo.casos, alojamientoId);

  return (
    <Marco titulo="Reservar" alVolver={volverSeguro(navigation)}>
      {detalle && sesion ? (
        <PantallaReservaManual
          casos={reservas.casos}
          alojamiento={{
            alojamientoId: detalle.id,
            anfitrionId: detalle.anfitrionId,
            titulo: detalle.titulo,
            unidades: detalle.unidades,
          }}
          cliente={{ id: sesion.usuarioId, nombre: sesion.nombre }}
          // "replace": al volver atrás no se regresa a un formulario ya usado, sino a la ficha.
          alCreada={(reservaId) => navigation.replace('Reserva', { reservaId })}
          alQuedoEnCola={() => navigation.navigate('MisReservas')}
        />
      ) : (
        <View style={estilos.centro}>
          {error ? (
            <>
              <Text accessibilityRole="alert" style={estilos.error}>
                No se pudieron cargar las habitaciones de {titulo}: {error}
              </Text>
              <Boton titulo={COMMON_TEXT.RETRY} onPress={recargar} />
            </>
          ) : cargando ? (
            <ActivityIndicator color={COLOR.primario} size="large" />
          ) : null}
        </View>
      )}
    </Marco>
  );
}
