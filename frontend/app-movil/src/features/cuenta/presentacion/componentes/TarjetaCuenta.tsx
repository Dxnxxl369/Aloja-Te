// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/TarjetaCuenta.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La tarjeta de arriba del perfil: la inicial en un círculo, el nombre, el correo y el tipo de cuenta.
// PARA QUÉ SIRVE: Que el usuario vea de un vistazo con qué cuenta entró.
// SIN ÉL: El perfil no diría quién eres.
// NO VA AQUÍ: Cerrar sesión ni nada que cambie la cuenta: solo muestra datos.
// ======================================================================

import { Text, View } from 'react-native';
import { Insignia } from '../../../../shared/ui/Insignia';
import { ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './TarjetaCuenta.styles';

interface Props {
  nombre: string;
  email: string;
  /** Texto del tipo de cuenta, por ejemplo "Huésped". */
  rol: string;
}

export function TarjetaCuenta({ nombre, email, rol }: Props) {
  const inicial = (nombre.trim()[0] ?? email.trim()[0] ?? '?').toUpperCase();
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.avatar}>
        <Text style={estilos.inicial}>{inicial}</Text>
      </View>
      <View style={estilos.datos}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {nombre || 'Mi cuenta'}
        </Text>
        <Text style={estilos.email} numberOfLines={1}>
          {email}
        </Text>
        {/* La insignia ocupa todo el ancho si no se la ata a la izquierda. */}
        <View style={{ alignSelf: 'flex-start', marginTop: ESPACIO.xs }}>
          <Insignia texto={rol} />
        </View>
      </View>
    </View>
  );
}
