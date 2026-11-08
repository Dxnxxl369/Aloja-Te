// ======================================================================
// ARCHIVO: agente/presentacion/componentes/IndicadorModoIa.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: Un botón con icono junto al título del agente: una flecha de descarga si el agente entiende con reglas simples ("modo básico"), un chip verde si ya usa la IA local del celular.
// PARA QUÉ SIRVE: Que se note que de ahí se descarga (o se gestiona) la IA local del móvil, sin gastar una fila de la pantalla.
// SIN ÉL: El usuario no sabría si el agente usa IA local ni cómo activarla (aunque también se llega desde Perfil).
// NO VA AQUÍ: Cargar el modelo ni navegar: avisa con `alPresionar`.
// ======================================================================

import { Cpu, Download } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { COLOR } from '../../../../shared/ui/tema';

interface Props {
  modo: 'local' | 'basico';
  alPresionar: () => void;
}

export function IndicadorModoIa({ modo, alPresionar }: Props) {
  const local = modo === 'local';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        local
          ? 'Agente inteligente funcionando en tu celular. Toca para gestionarlo'
          : 'El agente entiende frases simples. Toca para descargar el agente inteligente en tu celular'
      }
      onPress={alPresionar}
      hitSlop={4}
      style={({ pressed }) => [estilos.boton, local && estilos.botonLocal, pressed && { opacity: 0.8 }]}
    >
      {local ? <Cpu color={COLOR.exitoOscuro} size={20} /> : <Download color={COLOR.primario} size={20} />}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // Mismo tamaño y estilo que el botón de compartir de las otras cabeceras.
  boton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  botonLocal: { backgroundColor: '#dcfce7' },
});
