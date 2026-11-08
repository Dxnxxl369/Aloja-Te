// ======================================================================
// ARCHIVO: agente/presentacion/pantallas/PantallaAgente.styles.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Los estilos (medidas, colores y tipografía) de la pantalla del agente de reservas.
// PARA QUÉ SIRVE: Que PantallaAgente.tsx solo tenga el componente: el aspecto se ajusta aquí, sin tocar la lógica.
// SIN ÉL: Los estilos estarían dentro de PantallaAgente.tsx.
// NO VA AQUÍ: Lógica, textos ni datos. Los colores y medidas salen de shared/ui/tema.ts.
// ======================================================================

import { StyleSheet } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  // flexGrow + flex-end: el chat se apoya abajo (junto a la barra de escribir), como en cualquier app de mensajes.
  contenido: { flexGrow: 1, justifyContent: 'flex-end', padding: ESPACIO.l, gap: ESPACIO.m },

  cabecera: { backgroundColor: COLOR.tarjeta, borderBottomWidth: 1, borderBottomColor: COLOR.borde },
  cabeceraFila: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.m },

  filaMensaje: { flexDirection: 'row', alignItems: 'flex-end', gap: ESPACIO.s },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  burbuja: { paddingHorizontal: ESPACIO.l, paddingVertical: ESPACIO.m, borderRadius: RADIO.tarjeta },
  usuario: { backgroundColor: COLOR.primario, borderBottomRightRadius: 4 },
  agente: { backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde, borderBottomLeftRadius: 4 },
  escribiendo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  textoUsuario: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.blanco },
  textoAgente: { ...FUENTE.normal, fontSize: TAMANO.cuerpo, lineHeight: 20, color: COLOR.texto },
  hora: { ...FUENTE.normal, fontSize: TAMANO.pequeno, color: COLOR.textoSuave, marginTop: 4 },

  fila: { flexDirection: 'row', gap: ESPACIO.s },

  // Tarjeta de la búsqueda en curso: queda alineada con el texto de la burbuja (ancho del avatar + separación).
  progresoBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    marginLeft: 40,
    padding: ESPACIO.m,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.campo,
  },
  progresoIcono: { width: 44, height: 44, borderRadius: RADIO.control, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  progresoTitulo: { ...FUENTE.semi, fontSize: TAMANO.secundario, color: COLOR.texto },
  progresoTexto: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave },

  pie: { backgroundColor: COLOR.fondo, borderTopWidth: 1, borderTopColor: COLOR.borde },
  // flexGrow 0: una fila que se desliza de lado no debe crecer hacia abajo.
  franja: { flexGrow: 0 },
  chips: { gap: ESPACIO.s, alignItems: 'center', paddingHorizontal: ESPACIO.l, paddingTop: ESPACIO.m },
  entrada: { flexDirection: 'row', gap: ESPACIO.s, padding: ESPACIO.l, alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.control,
    paddingHorizontal: ESPACIO.l,
    backgroundColor: COLOR.tarjeta,
    ...FUENTE.normal,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  // Botón de enviar redondo, solo con el icono: azul con texto escrito, gris sin texto.
  enviar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center' },
  enviarInactivo: { backgroundColor: COLOR.campo },
});
