// ======================================================================
// ARCHIVO: anfitrion/presentacion/componentes/ModalEditarPropiedad.tsx
// QUÉ ES: Editor móvil para actualizar título, precios, fotos y habitaciones de una propiedad.
// ======================================================================

import * as ImagePicker from 'expo-image-picker';
import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';
import {
  BedDouble,
  Building2,
  Camera,
  CheckCircle2,
  DollarSign,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_URL } from '../../../../core/base/constantes';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { PropiedadAnfitrion, UnidadAlojamiento } from '../../domain/modelos';

interface Props {
  visible: boolean;
  onClose: () => void;
  propiedad: PropiedadAnfitrion | null;
  onActualizado: () => void;
  repo: {
    actualizarPropiedad: (idAlojamiento: string, datos: any) => Promise<any>;
    crearUnidad?: (idAlojamiento: string, datos: any) => Promise<any>;
  };
}

export function ModalEditarPropiedad({
  visible,
  onClose,
  propiedad,
  onActualizado,
  repo,
}: Props) {
  if (!propiedad) return null;

  const [titulo, setTitulo] = useState(propiedad.titulo);
  const [descripcion, setDescripcion] = useState(propiedad.descripcion || '');
  const [precioNoche, setPrecioNoche] = useState(String(propiedad.precioNoche));
  const [fotos, setFotos] = useState<string[]>(propiedad.fotos || (propiedad.fotoPrincipal ? [propiedad.fotoPrincipal] : []));
  const [unidades, setUnidades] = useState<UnidadAlojamiento[]>(propiedad.unidades || []);

  // Modal para agregar una nueva habitación
  const [nombreNuevaUnidad, setNombreNuevaUnidad] = useState('');
  const [precioNuevaUnidad, setPrecioNuevaUnidad] = useState('250');
  const [capacidadNuevaUnidad, setCapacidadNuevaUnidad] = useState('2');
  const [mostrarFormNuevaUnidad, setMostrarFormNuevaUnidad] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const seleccionarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso necesario', 'Concede permiso para acceder a la galería.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const first = res.assets[0];
        if (first?.uri) {
          setFotos((prev) => [...prev, first.uri]);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const eliminarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const subirFotoS3 = async (uri: string): Promise<string> => {
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    const uploadUrl = `${API_URL}/api/v1/alojamientos/imagenes?carpeta=alojamientos`;
    const res = await uploadAsync(uploadUrl, uri, {
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
      fieldName: 'archivo',
    });
    if (res.status >= 200 && res.status < 300) {
      const data = JSON.parse(res.body);
      return data.url;
    }
    throw new Error('Error al subir imagen a S3');
  };

  const agregarUnidad = async () => {
    if (!nombreNuevaUnidad.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la habitación.');
      return;
    }

    const nueva: UnidadAlojamiento = {
      id: `u-${Date.now()}`,
      nombre: nombreNuevaUnidad.trim(),
      precioNoche: Number(precioNuevaUnidad) || 200,
      capacidad: Number(capacidadNuevaUnidad) || 2,
      estado: 'DISPONIBLE',
    };

    if (repo.crearUnidad) {
      try {
        await repo.crearUnidad(propiedad.id, {
          nombre: nueva.nombre,
          precioNoche: nueva.precioNoche,
          capacidadHuespedes: nueva.capacidad,
          estado: 'DISPONIBLE',
        });
      } catch (err) {
        console.warn('Error al crear unidad en servidor:', err);
      }
    }

    setUnidades((prev) => [...prev, nueva]);
    setNombreNuevaUnidad('');
    setMostrarFormNuevaUnidad(false);
    Alert.alert('Habitación agregada', 'La nueva habitación ha sido registrada.');
  };

  const guardarCambios = async () => {
    if (!titulo.trim()) {
      Alert.alert('Campo obligatorio', 'Ingresa un título para el alojamiento.');
      return;
    }

    setGuardando(true);
    try {
      const fotosSubidas: string[] = [];
      for (const uri of fotos) {
        try {
          const urlFinal = await subirFotoS3(uri);
          if (urlFinal) fotosSubidas.push(urlFinal);
        } catch {}
      }

      const fotosObj = fotosSubidas.map((url, i) => ({ url, orden: i, descripcion: 'Foto propiedad' }));

      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        precioBaseNoche: Number(precioNoche) || 250,
        precioNoche: Number(precioNoche) || 250,
        fotografias: fotosObj,
        fotos: fotosSubidas,
      };

      await repo.actualizarPropiedad(propiedad.id, payload);

      Alert.alert('Actualizado con éxito', 'Los cambios en tu propiedad han sido guardados en el servidor.', [
        { text: 'Aceptar', onPress: () => { onClose(); onActualizado(); } },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudieron guardar las modificaciones.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={estilos.overlay}>
        <View style={estilos.contenedorModal}>
          <View style={estilos.cabecera}>
            <View>
              <Text style={estilos.tituloModal}>Gestionar Alojamiento</Text>
              <Text style={estilos.subtituloModal}>{propiedad.tipoPropiedadNombre} · {propiedad.ciudad}</Text>
            </View>
            <Pressable onPress={onClose} style={estilos.botonCerrar}>
              <X color={COLOR.textoSuave} size={20} />
            </Pressable>
          </View>

          <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent}>
            <Text style={estilos.etiqueta}>Título del Anuncio</Text>
            <TextInput style={estilos.input} value={titulo} onChangeText={setTitulo} />

            <Text style={estilos.etiqueta}>Descripción</Text>
            <TextInput
              style={[estilos.input, estilos.inputArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />

            <Text style={estilos.etiqueta}>Tarifa Base por Noche (Bs.)</Text>
            <TextInput
              style={estilos.input}
              value={precioNoche}
              onChangeText={setPrecioNoche}
              keyboardType="numeric"
            />

            {/* Habitaciones / Unidades */}
            <View style={estilos.seccionUnidades}>
              <View style={estilos.cabeceraSeccion}>
                <Text style={estilos.subtituloSeccion}>Habitaciones ({unidades.length})</Text>
                <Pressable
                  onPress={() => setMostrarFormNuevaUnidad(!mostrarFormNuevaUnidad)}
                  style={estilos.botonAgregarMini}
                >
                  <Plus color={COLOR.primario} size={15} />
                  <Text style={estilos.textoAgregarMini}>Agregar habitación</Text>
                </Pressable>
              </View>

              {mostrarFormNuevaUnidad && (
                <View style={estilos.cajaNuevaUnidad}>
                  <Text style={estilos.etiquetaMini}>Nombre de habitación</Text>
                  <TextInput
                    style={estilos.input}
                    value={nombreNuevaUnidad}
                    onChangeText={setNombreNuevaUnidad}
                    placeholder="Ej: Suite Matrimonial Vista Jardín"
                    placeholderTextColor={COLOR.textoSuave}
                  />
                  <View style={estilos.filaDosCampos}>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.etiquetaMini}>Precio (Bs.)</Text>
                      <TextInput
                        style={estilos.input}
                        value={precioNuevaUnidad}
                        onChangeText={setPrecioNuevaUnidad}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.etiquetaMini}>Capacidad</Text>
                      <TextInput
                        style={estilos.input}
                        value={capacidadNuevaUnidad}
                        onChangeText={setCapacidadNuevaUnidad}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <Boton titulo="Guardar Habitación" onPress={agregarUnidad} variante="secundario" />
                </View>
              )}

              {unidades.length === 0 ? (
                <Text style={estilos.textoVacio}>No tiene habitaciones registradas.</Text>
              ) : (
                unidades.map((u, i) => (
                  <View key={u.id || i} style={estilos.tarjetaUnidad}>
                    <View style={estilos.infoUnidad}>
                      <Text style={estilos.nombreUnidad}>{u.nombre}</Text>
                      <Text style={estilos.detalleUnidad}>
                        Capacidad: {u.capacidad} pers. · Bs. {u.precioNoche}/noche
                      </Text>
                    </View>
                    <View style={estilos.badgeEstado}>
                      <Text style={estilos.badgeEstadoTexto}>{u.estado || 'DISPONIBLE'}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Fotografías */}
            <View style={estilos.seccionFotos}>
              <View style={estilos.cabeceraSeccion}>
                <Text style={estilos.etiqueta}>Fotos de la Propiedad ({fotos.length})</Text>
                <Pressable onPress={seleccionarFoto} style={estilos.botonAgregarMini}>
                  <Camera color={COLOR.primario} size={15} />
                  <Text style={estilos.textoAgregarMini}>Agregar foto</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.galeriaScroll}>
                {fotos.map((uri, idx) => (
                  <View key={idx} style={estilos.fotoContenedor}>
                    <Image source={{ uri }} style={estilos.fotoMiniatura} />
                    <Pressable onPress={() => eliminarFoto(idx)} style={estilos.botonQuitarFoto}>
                      <X color="#fff" size={14} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={estilos.pie}>
            <Boton
              titulo={guardando ? 'Guardando cambios…' : 'Guardar Modificaciones'}
              onPress={guardarCambios}
              deshabilitado={guardando}
              iconoIzquierda={(c) =>
                guardando ? <ActivityIndicator size="small" color={c} /> : <Save color={c} size={18} />
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  contenedorModal: {
    backgroundColor: COLOR.fondo,
    borderTopLeftRadius: RADIO.tarjeta + 8,
    borderTopRightRadius: RADIO.tarjeta + 8,
    maxHeight: '90%',
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ESPACIO.m,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borde,
  },
  tituloModal: {
    ...FUENTE.tituloFuerte,
    fontSize: 18,
    color: COLOR.texto,
  },
  subtituloModal: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  botonCerrar: {
    padding: 6,
  },
  scroll: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: ESPACIO.m,
    gap: ESPACIO.s,
  },
  etiqueta: {
    ...FUENTE.semi,
    fontSize: TAMANO.pequeno,
    color: COLOR.texto,
    marginTop: 4,
  },
  etiquetaMini: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    marginBottom: 2,
  },
  input: {
    backgroundColor: COLOR.campo,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.control,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 10,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  inputArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  seccionUnidades: {
    backgroundColor: COLOR.tarjeta,
    padding: ESPACIO.s,
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.borde,
    gap: ESPACIO.s,
    marginTop: ESPACIO.xs,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtituloSeccion: {
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  botonAgregarMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  textoAgregarMini: {
    ...FUENTE.semi,
    fontSize: TAMANO.pequeno,
    color: COLOR.primario,
  },
  cajaNuevaUnidad: {
    backgroundColor: COLOR.campo,
    padding: ESPACIO.s,
    borderRadius: RADIO.control,
    gap: 6,
  },
  filaDosCampos: {
    flexDirection: 'row',
    gap: ESPACIO.s,
  },
  tarjetaUnidad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR.campo,
    padding: ESPACIO.s,
    borderRadius: RADIO.control,
  },
  infoUnidad: {
    flex: 1,
  },
  nombreUnidad: {
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  detalleUnidad: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  badgeEstado: {
    backgroundColor: COLOR.exitoFondo,
    borderWidth: 1,
    borderColor: COLOR.exitoBorde,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIO.pildora,
  },
  badgeEstadoTexto: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: COLOR.exitoOscuro,
  },
  textoVacio: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    fontStyle: 'italic',
    padding: 4,
  },
  seccionFotos: {
    marginTop: ESPACIO.xs,
    gap: ESPACIO.xs,
  },
  galeriaScroll: {
    marginVertical: 4,
  },
  fotoContenedor: {
    position: 'relative',
    marginRight: ESPACIO.s,
  },
  fotoMiniatura: {
    width: 80,
    height: 80,
    borderRadius: RADIO.control,
  },
  botonQuitarFoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADIO.pildora,
    padding: 3,
  },
  pie: {
    padding: ESPACIO.m,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
  },
});
