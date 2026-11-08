// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaPoliticas.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: El bloque "Políticas": las reglas del alojamiento (fumar, mascotas, fiestas, desayuno…).
// PARA QUÉ SIRVE: Que el huésped sepa las reglas antes de reservar. Si el texto es largo se recorta con "Ver más".
// SIN ÉL: Las reglas del anfitrión no se verían.
// NO VA AQUÍ: Cargar datos: recibe el texto.
// ======================================================================
// Datos: politicas ← alojamientos.politicas. Sin texto, el bloque no aparece.

import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLOR, FUENTE, TAMANO } from '../../../../../shared/ui/tema';
import { BloqueFicha } from './BloqueFicha';

/** A partir de cuántas letras se recorta el texto. */
const LARGO_CORTO = 180;
const LINEAS_CORTAS = 4;

export function FichaPoliticas({ politicas }: { politicas?: string }) {
  const [abierto, setAbierto] = useState(false);
  if (!politicas) return null;
  const largo = politicas.length > LARGO_CORTO;

  return (
    <BloqueFicha titulo="Políticas">
      <Text style={estilos.texto} numberOfLines={largo && !abierto ? LINEAS_CORTAS : undefined}>
        {politicas}
      </Text>
      {largo ? (
        <Pressable accessibilityRole="button" onPress={() => setAbierto((a) => !a)} style={estilos.enlace}>
          <Text style={estilos.enlaceTexto}>{abierto ? 'Ver menos' : 'Ver más'}</Text>
        </Pressable>
      ) : null}
    </BloqueFicha>
  );
}

const estilos = StyleSheet.create({
  texto: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 22, color: COLOR.texto },
  enlace: { minHeight: 44, justifyContent: 'center' },
  enlaceTexto: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.primario },
});
