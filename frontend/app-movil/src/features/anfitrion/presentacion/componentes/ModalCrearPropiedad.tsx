// ======================================================================
// ARCHIVO: anfitrion/presentacion/componentes/ModalCrearPropiedad.tsx
// QUÉ ES: Asistente modal para crear un nuevo alojamiento (Casa o Hotel) con fotos reales en S3.
// ======================================================================

import * as ImagePicker from 'expo-image-picker';
import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';
import {
  BedDouble,
  Building2,
  Camera,
  CheckCircle2,
  Home,
  Plus,
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

const DEPARTAMENTOS = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Tarija',
  'Chuquisaca',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  anfitrionId: string;
  onCreado: () => void;
  repo: {
    crearPropiedad: (anfitrionId: string, datos: any) => Promise<any>;
    crearUnidad?: (idAlojamiento: string, datos: any) => Promise<any>;
  };
}

export function ModalCrearPropiedad({ visible, onClose, anfitrionId, onCreado, repo }: Props) {
  const [modalidad, setModalidad] = useState<'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL'>('CASA_DEPARTAMENTO');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoPropiedad, setTipoPropiedad] = useState('Casa');
  const [departamento, setDepartamento] = useState('Santa Cruz');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [precioNoche, setPrecioNoche] = useState('350');
  const [capacidad, setCapacidad] = useState('4');

  // Fotos locales seleccionadas
  const [fotosLocales, setFotosLocales] = useState<string[]>([]);

  // Unidades si es Hotel
  const [habitaciones, setHabitaciones] = useState<Array<{ nombre: string; precio: string; capacidad: string }>>([
    { nombre: 'Habitación Simple', precio: '200', capacidad: '1' },
    { nombre: 'Habitación Doble', precio: '350', capacidad: '2' },
  ]);

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
          setFotosLocales((prev) => [...prev, first.uri]);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const eliminarFoto = (index: number) => {
    setFotosLocales((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarHabitacion = () => {
    setHabitaciones((prev) => [
      ...prev,
      { nombre: `Habitación ${prev.length + 1}`, precio: '250', capacidad: '2' },
    ]);
  };

  const eliminarHabitacion = (index: number) => {
    if (habitaciones.length <= 1) {
      Alert.alert('Aviso', 'Un hotel debe tener al menos una habitación.');
      return;
    }
    setHabitaciones((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor ingresa el título del alojamiento.');
      return;
    }
    if (!ciudad.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor ingresa la ciudad.');
      return;
    }

    setGuardando(true);
    try {
      // 1. Subir fotos a S3
      const fotosUrls: string[] = [];
      for (const uri of fotosLocales) {
        try {
          const urlSubida = await subirFotoS3(uri);
          if (urlSubida) fotosUrls.push(urlSubida);
        } catch (e) {
          console.warn('Fallo al subir foto a S3, omitiendo:', e);
        }
      }

      // 2. Armar unidades iniciales
      const unidadesPayload =
        modalidad === 'HOTEL_HOSTAL'
          ? habitaciones.map((h, i) => ({
              nombre: h.nombre,
              precioNoche: Number(h.precio) || 200,
              capacidadHuespedes: Number(h.capacidad) || 2,
              numeroHabitacion: `${101 + i}`,
              estado: 'DISPONIBLE',
            }))
          : [
              {
                nombre: 'Propiedad Completa',
                precioNoche: Number(precioNoche) || 350,
                capacidadHuespedes: Number(capacidad) || 4,
                estado: 'DISPONIBLE',
              },
            ];

      // 3. Crear en backend
      const fotosObj = fotosUrls.map((url, i) => ({ url, orden: i, descripcion: 'Foto propiedad' }));

      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipoPropiedad: tipoPropiedad.toUpperCase(),
        tipoPropiedadNombre: tipoPropiedad,
        modalidad,
        departamento,
        ciudad: ciudad.trim(),
        direccion: direccion.trim(),
        precioBaseNoche: Number(precioNoche) || 350,
        capacidadHuespedes: Number(capacidad) || 4,
        fotografias: fotosObj,
        fotos: fotosUrls,
        unidades: unidadesPayload,
      };

      const creado = await repo.crearPropiedad(anfitrionId, payload);
      const idAlojamiento = creado?.idAlojamiento || creado?.id;

      // Si es hotel y tiene repositorio para unidades
      if (idAlojamiento && modalidad === 'HOTEL_HOSTAL' && repo.crearUnidad) {
        for (const u of unidadesPayload) {
          try {
            await repo.crearUnidad(idAlojamiento, u);
          } catch {}
        }
      }

      Alert.alert(
        '¡Alojamiento Registrado!',
        'Tu propiedad ha sido enviada a moderación inteligente. Se revisará automáticamente y podrás verla publicada.',
        [{ text: 'Entendido', onPress: () => { onClose(); onCreado(); } }]
      );
    } catch (e: any) {
      Alert.alert('Error al crear', e?.message || 'No se pudo registrar la propiedad en el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={estilos.overlay}>
        <View style={estilos.contenedorModal}>
          <View style={estilos.cabecera}>
            <Text style={estilos.tituloModal}>Crear Nuevo Alojamiento</Text>
            <Pressable onPress={onClose} style={estilos.botonCerrar}>
              <X color={COLOR.textoSuave} size={20} />
            </Pressable>
          </View>

          <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent}>
            {/* Modalidad: Casa o Hotel */}
            <Text style={estilos.etiqueta}>Modalidad de Alojamiento</Text>
            <View style={estilos.selectorModalidad}>
              <Pressable
                onPress={() => setModalidad('CASA_DEPARTAMENTO')}
                style={[
                  estilos.opcionModalidad,
                  modalidad === 'CASA_DEPARTAMENTO' && estilos.opcionModalidadActiva,
                ]}
              >
                <Home color={modalidad === 'CASA_DEPARTAMENTO' ? COLOR.primario : COLOR.textoSuave} size={20} />
                <Text
                  style={[
                    estilos.textoModalidad,
                    modalidad === 'CASA_DEPARTAMENTO' && estilos.textoModalidadActivo,
                  ]}
                >
                  Casa / Departamento
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModalidad('HOTEL_HOSTAL')}
                style={[
                  estilos.opcionModalidad,
                  modalidad === 'HOTEL_HOSTAL' && estilos.opcionModalidadActiva,
                ]}
              >
                <Building2 color={modalidad === 'HOTEL_HOSTAL' ? COLOR.primario : COLOR.textoSuave} size={20} />
                <Text
                  style={[
                    estilos.textoModalidad,
                    modalidad === 'HOTEL_HOSTAL' && estilos.textoModalidadActivo,
                  ]}
                >
                  Hotel / Hostal
                </Text>
              </Pressable>
            </View>

            {/* Datos Generales */}
            <Text style={estilos.etiqueta}>Título del Anuncio</Text>
            <TextInput
              style={estilos.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Cabaña Boutique Los Tajibos"
              placeholderTextColor={COLOR.textoSuave}
            />

            <Text style={estilos.etiqueta}>Descripción</Text>
            <TextInput
              style={[estilos.input, estilos.inputArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe las instalaciones, vistas y comodidades..."
              placeholderTextColor={COLOR.textoSuave}
              multiline
              numberOfLines={3}
            />

            {/* Ubicación */}
            <View style={estilos.filaDosCampos}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.etiqueta}>Departamento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                  {DEPARTAMENTOS.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setDepartamento(d)}
                      style={[estilos.chip, departamento === d && estilos.chipActivo]}
                    >
                      <Text style={[estilos.chipTexto, departamento === d && estilos.chipTextoActivo]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={estilos.etiqueta}>Ciudad / Municipio</Text>
            <TextInput
              style={estilos.input}
              value={ciudad}
              onChangeText={setCiudad}
              placeholder="Ej: Santa Cruz de la Sierra"
              placeholderTextColor={COLOR.textoSuave}
            />

            <Text style={estilos.etiqueta}>Dirección exacta</Text>
            <TextInput
              style={estilos.input}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ej: Av. San Martín #450, Equipetrol"
              placeholderTextColor={COLOR.textoSuave}
            />

            {/* Precios y Capacidad si es Casa */}
            {modalidad === 'CASA_DEPARTAMENTO' ? (
              <View style={estilos.filaDosCampos}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.etiqueta}>Precio por Noche (Bs.)</Text>
                  <TextInput
                    style={estilos.input}
                    value={precioNoche}
                    onChangeText={setPrecioNoche}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.etiqueta}>Huéspedes Máximos</Text>
                  <TextInput
                    style={estilos.input}
                    value={capacidad}
                    onChangeText={setCapacidad}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              /* Habitaciones si es Hotel */
              <View style={estilos.seccionHabitaciones}>
                <View style={estilos.cabeceraSeccion}>
                  <Text style={estilos.subtituloSeccion}>Habitaciones del Hotel</Text>
                  <Pressable onPress={agregarHabitacion} style={estilos.botonAgregarMini}>
                    <Plus color={COLOR.primario} size={15} />
                    <Text style={estilos.textoAgregarMini}>Agregar habitación</Text>
                  </Pressable>
                </View>

                {habitaciones.map((h, idx) => (
                  <View key={idx} style={estilos.cajaHabitacion}>
                    <View style={estilos.filaHabitacionHeader}>
                      <TextInput
                        style={[estilos.input, { flex: 1, fontWeight: 'bold' }]}
                        value={h.nombre}
                        onChangeText={(txt) => {
                          setHabitaciones((prev) =>
                            prev.map((hab, i) => (i === idx ? { ...hab, nombre: txt } : hab)),
                          );
                        }}
                        placeholder="Nombre de habitación"
                        placeholderTextColor={COLOR.textoSuave}
                      />
                      <Pressable onPress={() => eliminarHabitacion(idx)} style={{ padding: 6 }}>
                        <Trash2 color={COLOR.error} size={18} />
                      </Pressable>
                    </View>
                    <View style={estilos.filaDosCampos}>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.miniEtiqueta}>Precio (Bs.)</Text>
                        <TextInput
                          style={estilos.input}
                          value={h.precio}
                          onChangeText={(txt) => {
                            setHabitaciones((prev) =>
                              prev.map((hab, i) => (i === idx ? { ...hab, precio: txt } : hab)),
                            );
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.miniEtiqueta}>Capacidad (pers.)</Text>
                        <TextInput
                          style={estilos.input}
                          value={h.capacidad}
                          onChangeText={(txt) => {
                            setHabitaciones((prev) =>
                              prev.map((hab, i) => (i === idx ? { ...hab, capacidad: txt } : hab)),
                            );
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Fotografías */}
            <View style={estilos.seccionFotos}>
              <View style={estilos.cabeceraSeccion}>
                <Text style={estilos.etiqueta}>Fotografías ({fotosLocales.length})</Text>
                <Pressable onPress={seleccionarFoto} style={estilos.botonAgregarMini}>
                  <Camera color={COLOR.primario} size={15} />
                  <Text style={estilos.textoAgregarMini}>Tomar / Subir foto</Text>
                </Pressable>
              </View>

              {fotosLocales.length === 0 ? (
                <Pressable onPress={seleccionarFoto} style={estilos.cajaSinFotos}>
                  <Camera color={COLOR.textoSuave} size={30} />
                  <Text style={estilos.textoSinFotos}>Selecciona fotos de la propiedad para la galería</Text>
                </Pressable>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.galeriaScroll}>
                  {fotosLocales.map((uri, idx) => (
                    <View key={idx} style={estilos.fotoContenedor}>
                      <Image source={{ uri }} style={estilos.fotoMiniatura} />
                      <Pressable onPress={() => eliminarFoto(idx)} style={estilos.botonQuitarFoto}>
                        <X color="#fff" size={14} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          <View style={estilos.pie}>
            <Boton
              titulo={guardando ? 'Guardando en la Nube…' : 'Publicar y Enviar a Revisión'}
              onPress={handleSubmit}
              deshabilitado={guardando}
              iconoIzquierda={(c) =>
                guardando ? <ActivityIndicator size="small" color={c} /> : <CheckCircle2 color={c} size={18} />
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
  miniEtiqueta: {
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
  selectorModalidad: {
    flexDirection: 'row',
    gap: ESPACIO.s,
    marginBottom: ESPACIO.xs,
  },
  opcionModalidad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.tarjeta,
  },
  opcionModalidadActiva: {
    borderColor: COLOR.primario,
    backgroundColor: COLOR.primarioSuave,
  },
  textoModalidad: {
    ...FUENTE.semi,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  textoModalidadActivo: {
    color: COLOR.primario,
  },
  filaDosCampos: {
    flexDirection: 'row',
    gap: ESPACIO.s,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIO.pildora,
    borderWidth: 1,
    borderColor: COLOR.borde,
    marginRight: 6,
    backgroundColor: COLOR.tarjeta,
  },
  chipActivo: {
    backgroundColor: COLOR.primario,
    borderColor: COLOR.primario,
  },
  chipTexto: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  chipTextoActivo: {
    color: '#fff',
    ...FUENTE.semi,
  },
  seccionHabitaciones: {
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
  cajaHabitacion: {
    backgroundColor: COLOR.campo,
    padding: ESPACIO.s,
    borderRadius: RADIO.control,
    gap: 6,
  },
  filaHabitacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seccionFotos: {
    marginTop: ESPACIO.xs,
    gap: ESPACIO.xs,
  },
  cajaSinFotos: {
    height: 100,
    borderWidth: 1.5,
    borderColor: COLOR.borde,
    borderStyle: 'dashed',
    borderRadius: RADIO.control,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: ESPACIO.m,
  },
  textoSinFotos: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    textAlign: 'center',
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
