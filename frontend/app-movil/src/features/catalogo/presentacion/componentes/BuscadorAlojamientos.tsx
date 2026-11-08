// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/BuscadorAlojamientos.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La barra de búsqueda del explorador con el botón de filtros a la derecha.
// PARA QUÉ SIRVE: Buscar por ciudad, nombre o tipo, y abrir la hoja de filtros.
// SIN ÉL: El explorador no tendría búsqueda.
// NO VA AQUÍ: Qué se filtra: solo avisa lo que escribe el usuario.
// ======================================================================

import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';

interface Props {
  texto: string;
  alCambiarTexto: (texto: string) => void;
  alAbrirFiltros: () => void;
  /** Muestra un punto en el botón cuando hay filtros del servidor aplicados. */
  filtrosActivos: boolean;
}

export function BuscadorAlojamientos({ texto, alCambiarTexto, alAbrirFiltros, filtrosActivos }: Props) {
  return (
    <View style={estilos.barra}>
      <Search color={COLOR.primario} size={20} />
      <TextInput
        style={estilos.input}
        value={texto}
        onChangeText={alCambiarTexto}
        placeholder="Buscar ciudad, cabaña o hotel…"
        placeholderTextColor={COLOR.textoSuave}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar alojamientos"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={filtrosActivos ? 'Filtros (hay filtros aplicados)' : 'Filtros'}
        onPress={alAbrirFiltros}
        style={({ pressed }) => [estilos.filtros, pressed && { backgroundColor: COLOR.borde }]}
      >
        <SlidersHorizontal color={COLOR.texto} size={20} />
        {filtrosActivos ? <View style={estilos.punto} /> : null}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    minHeight: 52,
    paddingLeft: ESPACIO.l,
    paddingRight: ESPACIO.s,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    ...SOMBRA_FLOTANTE,
  },
  input: { flex: 1, fontFamily: FUENTE.normal, fontSize: 15, color: COLOR.texto, paddingVertical: ESPACIO.m },
  filtros: { width: 40, height: 40, borderRadius: RADIO.control, backgroundColor: COLOR.campo, alignItems: 'center', justifyContent: 'center' },
  punto: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR.primario, borderWidth: 2, borderColor: COLOR.campo },
});
