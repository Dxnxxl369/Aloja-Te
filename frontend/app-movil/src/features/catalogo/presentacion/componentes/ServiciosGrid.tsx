// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ServiciosGrid.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La cuadrícula "Lo que ofrece este lugar": cada servicio con su icono, en dos columnas.
// PARA QUÉ SIRVE: Ver de un vistazo si hay wifi, piscina, estacionamiento, etc.
// SIN ÉL: Los servicios serían una lista de texto.
// NO VA AQUÍ: Cargar los servicios (recibe los nombres que publica MS-01) ni decidir qué icono toca (es serviceIcons.ts).
// ======================================================================
// El icono se escoge por el nombre; si no se reconoce, es un check. Se muestran los primeros y el resto con "Ver los N servicios".

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import { MAX_SERVICES_COLLAPSED } from '../../constantes';
import { SERVICE_ICONS } from '../serviceIconMap';
import { serviceIconKey } from '../serviceIcons';
import { estilos } from './ServiciosGrid.styles';

export function ServiciosGrid({ servicios }: { servicios: string[] }) {
  const [verTodos, setVerTodos] = useState(false);
  if (servicios.length === 0) return null;
  const visibles = verTodos ? servicios : servicios.slice(0, MAX_SERVICES_COLLAPSED);
  const sobran = servicios.length - MAX_SERVICES_COLLAPSED;

  return (
    <View style={{ gap: ESPACIO.m }}>
      <View style={estilos.grilla}>
        {visibles.map((nombre) => {
          const Icono = SERVICE_ICONS[serviceIconKey(nombre)];
          return (
            <View key={nombre} style={estilos.item}>
              <Icono color={COLOR.primario} size={20} />
              <Text style={estilos.texto} numberOfLines={2}>
                {nombre}
              </Text>
            </View>
          );
        })}
      </View>
      {sobran > 0 && (
        <Pressable accessibilityRole="button" onPress={() => setVerTodos((v) => !v)} style={estilos.enlace}>
          <Text style={estilos.enlaceTexto}>{verTodos ? COMMON_TEXT.SEE_LESS : `Ver los ${servicios.length} servicios`}</Text>
        </Pressable>
      )}
    </View>
  );
}
