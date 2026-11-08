// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/TiposAlojamiento.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La fila "Explora por tipo": un botón redondo con icono por cada tipo de propiedad de MS-01.
// PARA QUÉ SIRVE: Filtrar la lista con un toque ("Hotel / Hostal", "Cabaña"…).
// SIN ÉL: Solo se podría filtrar por ciudad.
// NO VA AQUÍ: Cargar los tipos ni filtrar: avisa con `alElegir`.
// ======================================================================
// Los tipos son los reales del catálogo; el icono se escoge por el nombre y, si no se reconoce, es un edificio.

import { Bed, Building2, Hotel, House, Tent } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { TipoPropiedad } from '../../domain/modelos';

interface Props {
  tipos: TipoPropiedad[];
  /** Id del tipo elegido; null si ninguno. */
  seleccionado: number | null;
  /** Tocar el tipo ya elegido lo quita (llega null). */
  alElegir: (id: number | null) => void;
}

function iconoDe(nombre: string): LucideIcon {
  const n = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  if (/boutique/.test(n)) return Bed;
  if (/hotel|hostal|hospedaje/.test(n)) return Hotel;
  if (/cabana|casa|depart|finca|hacienda/.test(n)) return House;
  if (/glamping|carpa|camping/.test(n)) return Tent;
  return Building2;
}

export function TiposAlojamiento({ tipos, seleccionado, alElegir }: Props) {
  if (tipos.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {tipos.map((t) => {
        const activo = seleccionado === t.id;
        const Icono = iconoDe(t.nombre);
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            accessibilityLabel={t.nombre}
            accessibilityState={{ selected: activo }}
            onPress={() => alElegir(activo ? null : t.id)}
            style={[estilos.tarjeta, activo && estilos.tarjetaActiva]}
          >
            <View style={[estilos.circulo, activo && { backgroundColor: COLOR.primario }]}>
              <Icono color={activo ? '#fff' : COLOR.primario} size={22} />
            </View>
            <Text style={[estilos.nombre, activo && { color: COLOR.primario }]} numberOfLines={2}>
              {t.nombre}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: ESPACIO.m },
  tarjeta: {
    width: 92,
    alignItems: 'center',
    gap: ESPACIO.s,
    paddingVertical: ESPACIO.m,
    paddingHorizontal: ESPACIO.s,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  tarjetaActiva: { borderColor: COLOR.primario, backgroundColor: COLOR.primarioSuave },
  circulo: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontFamily: FUENTE.medio, fontSize: 12, color: COLOR.textoSuave, textAlign: 'center' },
});
