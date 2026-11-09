// ======================================================================
// ARCHIVO: anfitrion/presentacion/componentes/TarjetaKpi.tsx
// QUÉ ES: Tarjeta métrica ejecutiva para el Dashboard del anfitrión.
// ======================================================================

import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

interface Props {
  titulo: string;
  valor: string;
  subtexto?: string;
  Icono: LucideIcon;
  colorIcono?: string;
}

export function TarjetaKpi({ titulo, valor, subtexto, Icono, colorIcono = COLOR.primario }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <View style={[estilos.iconoContenedor, { backgroundColor: COLOR.primarioSuave }]}>
          <Icono color={colorIcono} size={18} />
        </View>
      </View>
      <Text style={estilos.valor}>{valor}</Text>
      {subtexto ? <Text style={estilos.subtexto}>{subtexto}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    gap: ESPACIO.xs,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    ...FUENTE.medio,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  iconoContenedor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: {
    ...FUENTE.fuerte,
    fontSize: 20,
    color: COLOR.texto,
    marginTop: 2,
  },
  subtexto: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.exitoOscuro,
  },
});
