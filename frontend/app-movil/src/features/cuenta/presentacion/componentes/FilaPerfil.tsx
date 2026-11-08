// ======================================================================
// ARCHIVO: cuenta/presentacion/componentes/FilaPerfil.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Una fila tocable del perfil: icono, título, una línea de apoyo y una flecha.
// PARA QUÉ SIRVE: Que todas las opciones del perfil (Mis reservas, Agente inteligente…) se vean y se comporten igual.
// SIN ÉL: Cada opción repetiría el mismo diseño con pequeñas diferencias.
// NO VA AQUÍ: Qué pasa al tocarla: solo avisa con `alPresionar`.
// ======================================================================

import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';

interface Props {
  Icono: LucideIcon;
  titulo: string;
  subtitulo?: string;
  /** Línea fina debajo de la fila, para separarla de la siguiente dentro de la misma sección. */
  separador?: boolean;
  alPresionar: () => void;
}

export function FilaPerfil({ Icono, titulo, subtitulo, separador, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitulo ? `${titulo}. ${subtitulo}` : titulo}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.fila, separador && estilos.separador, pressed && { backgroundColor: COLOR.fondo }]}
    >
      <View style={estilos.icono}>
        <Icono color={COLOR.primario} size={22} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      </View>
      <ChevronRight color={COLOR.textoSuave} size={20} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.l },
  separador: { borderBottomWidth: 1, borderBottomColor: COLOR.borde },
  icono: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  titulo: { ...FUENTE.semi, fontSize: TAMANO.cuerpo, color: COLOR.texto },
  subtitulo: { ...FUENTE.normal, fontSize: TAMANO.secundario, lineHeight: 18, color: COLOR.textoSuave },
});
