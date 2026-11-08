// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/FiltrosSheet.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La hoja que sube desde abajo para elegir ciudad, precio máximo por noche y número de huéspedes.
// PARA QUÉ SIRVE: Afinar la lista sin llenar la pantalla de botones: la ciudad vive aquí, no en una fila suelta.
// SIN ÉL: Solo se podría buscar por texto.
// NO VA AQUÍ: Pedir los alojamientos ni filtrar: entrega lo elegido con `alAplicar`.
// ======================================================================
// Los cambios se guardan en un borrador: no se aplican hasta tocar "Aplicar".

import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Chip } from '../../../../shared/ui/Chip';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';
import { HUESPEDES_RAPIDOS, PRECIOS_MAX_RAPIDOS } from '../../constantes';
import type { FiltrosServidor } from '../../domain/modelos';

interface Props {
  visible: boolean;
  /** Precio y huéspedes que ya están aplicados. */
  valor: FiltrosServidor;
  /** Ciudades que se pueden elegir (las que aparecen en la lista). */
  ciudades: string[];
  /** Ciudad que ya está aplicada; null si ninguna. */
  ciudad: string | null;
  alCerrar: () => void;
  alAplicar: (filtros: FiltrosServidor, ciudad: string | null) => void;
}

export function FiltrosSheet({ visible, valor, ciudades, ciudad, alCerrar, alAplicar }: Props) {
  const insets = useSafeAreaInsets();
  const [borrador, setBorrador] = useState<FiltrosServidor>(valor);
  const [ciudadBorrador, setCiudadBorrador] = useState<string | null>(ciudad);

  // Cada vez que se abre, parte de lo que está aplicado.
  useEffect(() => {
    if (visible) {
      setBorrador(valor);
      setCiudadBorrador(ciudad);
    }
  }, [visible, valor, ciudad]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={alCerrar}>
      <Pressable style={estilos.fondo} onPress={alCerrar} accessibilityLabel="Cerrar filtros" />
      <View style={[estilos.hoja, { paddingBottom: ESPACIO.xl + insets.bottom }]}>
        <View style={estilos.agarre} />
        <Text style={estilos.titulo}>Filtros</Text>
        <ScrollView contentContainerStyle={{ gap: ESPACIO.xl }} keyboardShouldPersistTaps="handled">
          {ciudades.length > 0 && (
            <View style={estilos.grupo}>
              <Text style={estilos.etiqueta}>Ciudad</Text>
              <View style={estilos.chips}>
                <Chip etiqueta="Todas" seleccionado={ciudadBorrador === null} onPress={() => setCiudadBorrador(null)} />
                {ciudades.map((nombre) => (
                  <Chip
                    key={nombre}
                    etiqueta={nombre}
                    seleccionado={ciudadBorrador === nombre}
                    onPress={() => setCiudadBorrador(nombre)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={estilos.grupo}>
            <Text style={estilos.etiqueta}>Precio máximo por noche</Text>
            <View style={estilos.chips}>
              <Chip
                etiqueta="Sin límite"
                seleccionado={borrador.precioMax === undefined}
                onPress={() => setBorrador((b) => ({ ...b, precioMax: undefined }))}
              />
              {PRECIOS_MAX_RAPIDOS.map((p) => (
                <Chip
                  key={p}
                  etiqueta={`Bs ${p}`}
                  seleccionado={borrador.precioMax === p}
                  onPress={() => setBorrador((b) => ({ ...b, precioMax: p }))}
                />
              ))}
            </View>
          </View>

          <View style={estilos.grupo}>
            <Text style={estilos.etiqueta}>Huéspedes</Text>
            <View style={estilos.chips}>
              <Chip
                etiqueta="Cualquiera"
                seleccionado={borrador.huespedes === undefined}
                onPress={() => setBorrador((b) => ({ ...b, huespedes: undefined }))}
              />
              {HUESPEDES_RAPIDOS.map((n) => (
                <Chip
                  key={n}
                  etiqueta={`${n} ${n === 1 ? 'persona' : 'personas'}`}
                  seleccionado={borrador.huespedes === n}
                  onPress={() => setBorrador((b) => ({ ...b, huespedes: n }))}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={estilos.acciones}>
          <View style={{ flex: 1 }}>
            <Boton
              variante="contorno"
              titulo="Limpiar"
              onPress={() => {
                setBorrador({});
                setCiudadBorrador(null);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Boton
              titulo="Aplicar"
              onPress={() => {
                alAplicar(borrador, ciudadBorrador);
                alCerrar();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLOR.scrim },
  hoja: {
    backgroundColor: COLOR.tarjeta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: ESPACIO.l,
    paddingTop: ESPACIO.m,
    gap: ESPACIO.l,
    maxHeight: '80%',
  },
  agarre: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLOR.borde },
  titulo: { ...FUENTE.tituloFuerte, fontSize: TAMANO.titulo, color: COLOR.texto },
  grupo: { gap: ESPACIO.m },
  etiqueta: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
  acciones: { flexDirection: 'row', gap: ESPACIO.m },
});
