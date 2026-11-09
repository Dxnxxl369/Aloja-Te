// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaDatosRapidos.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: Una fila con lo esencial de un vistazo: capacidad máxima, hora de check-in y hora de check-out.
// PARA QUÉ SIRVE: Que el usuario vea cuántos pueden alojarse y a qué hora entra y sale sin leer las políticas.
// SIN ÉL: Esos tres datos estarían sueltos en distintas partes de la ficha.
// NO VA AQUÍ: Cargar datos: recibe los campos del alojamiento.
// ======================================================================
// Datos: capacidad ← la mayor capacidad_huespedes de unidades_reservables; horarios ← alojamientos.horario_entrada y horario_salida.
// Solo se dibujan los que existen; si no hay ninguno, el bloque no aparece.

import { LogIn, LogOut, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { pluralize } from '../../../../../shared/ui/plural';
import { COLOR } from '../../../../../shared/ui/tema';
import { estilos } from './FichaDatosRapidos.styles';

interface Props {
  capacidadMax?: number | null;
  horarioEntrada?: string;
  horarioSalida?: string;
}

interface Dato {
  Icono: LucideIcon;
  etiqueta: string;
  valor: string;
}

export function FichaDatosRapidos({ capacidadMax, horarioEntrada, horarioSalida }: Props) {
  const datos: Dato[] = [];
  if (capacidadMax) {
    datos.push({ Icono: Users, etiqueta: 'Capacidad', valor: `${capacidadMax} ${pluralize(capacidadMax, 'huésped', 'huéspedes')}` });
  }
  if (horarioEntrada) datos.push({ Icono: LogIn, etiqueta: 'Check-in', valor: horarioEntrada });
  if (horarioSalida) datos.push({ Icono: LogOut, etiqueta: 'Check-out', valor: horarioSalida });
  if (datos.length === 0) return null;

  return (
    <View style={estilos.fila}>
      {datos.map(({ Icono, etiqueta, valor }) => (
        <View key={etiqueta} style={estilos.dato} accessible accessibilityLabel={`${etiqueta}: ${valor}`}>
          <Icono color={COLOR.primario} size={20} />
          <Text style={estilos.etiqueta}>{etiqueta}</Text>
          <Text style={estilos.valor} numberOfLines={1}>
            {valor}
          </Text>
        </View>
      ))}
    </View>
  );
}
