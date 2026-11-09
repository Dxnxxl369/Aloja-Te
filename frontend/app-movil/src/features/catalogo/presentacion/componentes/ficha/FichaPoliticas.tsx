// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaPoliticas.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El bloque "Políticas": las reglas del alojamiento (fumar, mascotas, fiestas, desayuno…).
// PARA QUÉ SIRVE: Que el huésped sepa las reglas antes de reservar. Si el texto es largo se recorta con "Ver más".
// SIN ÉL: Las reglas del anfitrión no se verían.
// NO VA AQUÍ: Cargar datos: recibe el texto.
// ======================================================================
// Datos: politicas ← alojamientos.politicas. Sin texto, el bloque no aparece.

import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { COMMON_TEXT } from '../../../../../shared/ui/texts';
import { POLICIES_COLLAPSE_LENGTH, POLICIES_COLLAPSED_LINES } from '../../../constantes';
import { BloqueFicha } from './BloqueFicha';
import { estilos } from './FichaPoliticas.styles';

export function FichaPoliticas({ politicas }: { politicas?: string }) {
  const [abierto, setAbierto] = useState(false);
  if (!politicas) return null;
  const largo = politicas.length > POLICIES_COLLAPSE_LENGTH;

  return (
    <BloqueFicha titulo="Políticas">
      <Text style={estilos.texto} numberOfLines={largo && !abierto ? POLICIES_COLLAPSED_LINES : undefined}>
        {politicas}
      </Text>
      {largo ? (
        <Pressable accessibilityRole="button" onPress={() => setAbierto((a) => !a)} style={estilos.enlace}>
          <Text style={estilos.enlaceTexto}>{abierto ? COMMON_TEXT.SEE_LESS : 'Ver más'}</Text>
        </Pressable>
      ) : null}
    </BloqueFicha>
  );
}
