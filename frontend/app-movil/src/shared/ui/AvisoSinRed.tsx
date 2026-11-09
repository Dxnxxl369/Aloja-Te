// ======================================================================
// ARCHIVO: shared/ui/AvisoSinRed.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La franja que avisa "Sin internet · N operaciones pendientes de enviar" o "Enviando…".
// PARA QUÉ SIRVE: Que el usuario sepa que lo que hizo sin red NO se perdió y se enviará solo (modo offline-first).
// SIN ÉL: El usuario no sabría si su reserva quedó guardada.
// NO VA AQUÍ: Saber si hay red: recibe `conectado` y `pendientes` ya calculados (los da core con useEstadoSync).
// ======================================================================

import { CloudUpload, WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { pluralize } from './plural';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE, TAMANO } from './tema';

interface Props {
  conectado: boolean;
  pendientes: number;
}

export function AvisoSinRed({ conectado, pendientes }: Props) {
  if (conectado && pendientes === 0) return null;

  const sinRed = !conectado;
  const operaciones = `${pendientes} ${pluralize(pendientes, 'operación', 'operaciones')} ${pluralize(pendientes, 'pendiente', 'pendientes')} de enviar`;
  const texto = sinRed
    ? pendientes > 0
      ? `Sin internet · ${operaciones}`
      : 'Sin internet · puedes seguir usando la app'
    : `Enviando ${operaciones.replace(' de enviar', '')}…`;
  const color = sinRed ? COLOR.errorOscuro : COLOR.avisoOscuro;

  return (
    <View
      accessibilityRole="alert"
      style={[estilos.caja, { backgroundColor: sinRed ? COLOR.errorFondo : COLOR.avisoFondo, borderColor: sinRed ? COLOR.errorBorde : COLOR.avisoBorde }]}
    >
      {sinRed ? <WifiOff color={color} size={18} /> : <CloudUpload color={color} size={18} />}
      <Text style={[estilos.texto, { color }]} numberOfLines={2}>
        {texto}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.s,
    marginHorizontal: ESPACIO.l,
    marginTop: ESPACIO.s,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    ...SOMBRA_FLOTANTE,
  },
  texto: { flex: 1, ...FUENTE.semi, fontSize: TAMANO.secundario },
});
