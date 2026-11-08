// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/TarjetaCuenta.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La tarjeta de arriba del perfil: la inicial en un círculo, el nombre, el correo y el tipo de cuenta.
// PARA QUÉ SIRVE: Que el usuario vea de un vistazo con qué cuenta entró.
// SIN ÉL: El perfil no diría quién eres.
// NO VA AQUÍ: Cerrar sesión ni nada que cambie la cuenta: solo muestra datos.
// ======================================================================

import { StyleSheet, Text, View } from 'react-native';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

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

const estilos = StyleSheet.create({
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.l, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  inicial: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titular, color: '#fff' },
  datos: { flex: 1, gap: 2 },
  nombre: { ...FUENTE.tituloFuerte, fontSize: TAMANO.subtitulo, color: COLOR.texto },
  email: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },
});
