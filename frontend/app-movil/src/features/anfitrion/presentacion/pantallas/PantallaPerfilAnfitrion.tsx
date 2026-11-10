// ======================================================================
// ARCHIVO: anfitrion/presentacion/pantallas/PantallaPerfilAnfitrion.tsx
// QUÉ ES: Pantalla de Perfil de Anfitrión con carga de fotos de CI (anverso/reverso),
// configuración de cuenta bancaria y QR de cobro verídico.
// ======================================================================

import * as ImagePicker from 'expo-image-picker';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import {
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  FileText,
  IdCard,
  LogOut,
  Mail,
  Phone,
  QrCode,
  Save,
  ShieldCheck,
  Upload,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { useSesion } from '../../../../core';
import { API_URL } from '../../../../core/base/constantes';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';
import type { PerfilAnfitrionDetalle } from '../../domain/modelos';

const BANCOS_BOLIVIA = [
  'Banco Mercantil Santa Cruz (BMSC)',
  'Banco Nacional de Bolivia (BNB)',
  'Banco de Crédito BCP',
  'Banco Unión',
  'Banco Ganadero',
  'Banco Bisa',
  'Banco FIE',
  'Banco Sol',
];

const DEPARTAMENTOS_BOLIVIA = ['SC', 'LP', 'CB', 'TJ', 'CH', 'OR', 'PT', 'BE', 'PA'];

interface Props {
  repo: {
    obtenerPerfil: (id: string) => Promise<PerfilAnfitrionDetalle>;
    actualizarDatosBancarios: (
      anfitrionId: string,
      bancoNombre: string,
      numeroCuentaBancaria: string,
      qr: string | null
    ) => Promise<void>;
    actualizarPerfil?: (
      anfitrionId: string,
      datos: {
        nombre: string;
        apellido: string;
        telefono: string;
        ciAnversoUrl?: string | null;
        ciReversoUrl?: string | null;
      }
    ) => Promise<void>;
  };
  alCerrarSesion: () => void;
}

export function PantallaPerfilAnfitrion({ repo, alCerrarSesion }: Props) {
  const { sesion } = useSesion();
  const anfitrionId = sesion?.usuarioId || '99501cd9-47ae-4141-8c29-8cb1bb5d7e39';

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados editables
  const [nombre, setNombre] = useState(sesion?.nombre || 'Carlos');
  const [apellido, setApellido] = useState('Mendoza');
  const [email, setEmail] = useState(sesion?.email || '');
  const [telefono, setTelefono] = useState('+591 77012345');
  const [ci, setCi] = useState('5829104');
  const [ciExpedido, setCiExpedido] = useState('SC');
  const [ciAnverso, setCiAnverso] = useState<string | null>(null);
  const [ciReverso, setCiReverso] = useState<string | null>(null);
  const [bancoNombre, setBancoNombre] = useState('Banco Mercantil Santa Cruz (BMSC)');
  const [numeroCuenta, setNumeroCuenta] = useState('4010987654321');
  const [qrUri, setQrUri] = useState<string | null>(null);

  // Modales selectores
  const [modalBancos, setModalBancos] = useState(false);
  const [modalExpedido, setModalExpedido] = useState(false);

  useEffect(() => {
    let montado = true;
    (async () => {
      try {
        const datos = await repo.obtenerPerfil(anfitrionId);
        if (!montado) return;
        if (datos.nombre) setNombre(datos.nombre);
        if (datos.apellido) setApellido(datos.apellido);
        if (datos.email) setEmail(datos.email);
        if (datos.telefono) setTelefono(datos.telefono);
        if (datos.ci) setCi(datos.ci);
        if (datos.ciExpedido) setCiExpedido(datos.ciExpedido);
        if (datos.ciAnversoUrl) setCiAnverso(datos.ciAnversoUrl);
        if (datos.ciReversoUrl) setCiReverso(datos.ciReversoUrl);
        if (datos.bancoNombre) setBancoNombre(datos.bancoNombre);
        if (datos.numeroCuentaBancaria) setNumeroCuenta(datos.numeroCuentaBancaria);
        if (datos.qr) setQrUri(datos.qr);
      } catch (e) {
        console.warn('Error cargando perfil:', e);
      } finally {
        if (montado) setCargando(false);
      }
    })();
    return () => {
      montado = false;
    };
  }, [anfitrionId, repo]);

  // 1. Solo selecciona la foto y la guarda en la caché/estado local en vista previa
  const seleccionarFoto = async (tipo: 'ciAnverso' | 'ciReverso' | 'qr') => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Concede permiso para acceder a la galería y seleccionar la imagen.'
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        if (tipo === 'ciAnverso') setCiAnverso(asset.uri);
        if (tipo === 'ciReverso') setCiReverso(asset.uri);
        if (tipo === 'qr') setQrUri(asset.uri);

        Alert.alert('Foto seleccionada', 'Imagen cargada en vista previa. Presiona "Guardar Datos Bancarios" para guardarla.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.');
    }
  };

  // Helper para subir solo si es una imagen nueva local (evita duplicar fotos existentes)
  const subirSiEsLocal = async (uri: string | null, carpeta: string): Promise<string | null> => {
    if (!uri) return null;
    // Si ya empieza con http:// o https://, significa que ya está en la nube: NO volver a subir
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    // Es un archivo local nuevo de la galería (file:// o content://)
    const filename = uri.split('/').pop() || 'documento.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = (match && match[1]) ? match[1].toLowerCase() : 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const uploadUrl = `${API_URL}/api/v1/alojamientos/imagenes?carpeta=${carpeta}`;
    const uploadRes = await uploadAsync(uploadUrl, uri, {
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
      fieldName: 'archivo',
      mimeType: mimeType,
    });

    if (uploadRes.status >= 200 && uploadRes.status < 300) {
      const data = JSON.parse(uploadRes.body);
      return data.url;
    } else {
      throw new Error(`Error en el servidor (${uploadRes.status})`);
    }
  };

  // 2. Solo al presionar "Guardar Datos Bancarios", sube lo pendiente y guarda en el backend
  const guardarCambios = async () => {
    if (!numeroCuenta.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa tu número de cuenta bancaria.');
      return;
    }
    setGuardando(true);
    try {
      let ciAnversoFinal = ciAnverso;
      let ciReversoFinal = ciReverso;
      let qrFinal = qrUri;

      // Subir únicamente los que sean archivos locales nuevos (control anti-duplicados)
      if (ciAnverso && !ciAnverso.startsWith('http')) {
        ciAnversoFinal = await subirSiEsLocal(ciAnverso, 'carnets');
        if (ciAnversoFinal) setCiAnverso(ciAnversoFinal);
      }
      if (ciReverso && !ciReverso.startsWith('http')) {
        ciReversoFinal = await subirSiEsLocal(ciReverso, 'carnets');
        if (ciReversoFinal) setCiReverso(ciReversoFinal);
      }
      if (qrUri && !qrUri.startsWith('http')) {
        qrFinal = await subirSiEsLocal(qrUri, 'qr');
        if (qrFinal) setQrUri(qrFinal);
      }

      await repo.actualizarDatosBancarios(anfitrionId, bancoNombre, numeroCuenta.trim(), qrFinal);
      if (repo.actualizarPerfil) {
        await repo.actualizarPerfil(anfitrionId, {
          nombre,
          apellido,
          telefono,
          ciAnversoUrl: ciAnversoFinal,
          ciReversoUrl: ciReversoFinal,
        });
      }

      Alert.alert('Guardado con éxito', 'Los datos y documentos han sido guardados correctamente.');
    } catch (e: any) {
      console.error('Error guardando cambios:', e);
      Alert.alert('Error', 'No se pudo guardar la información en el servidor. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator color={COLOR.primario} size="large" />
        <Text style={estilos.textoCargando}>Cargando perfil oficial de anfitrión...</Text>
      </View>
    );
  }

  const requisitosCompletos = Boolean(ci.trim() && ciAnverso && ciReverso && qrUri);

  return (
    <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
      {/* 1. Tarjeta Resumen y Badge de Verificación */}
      <View style={estilos.tarjetaHeader}>
        <View style={estilos.filaHeader}>
          <View style={estilos.avatarContenedor}>
            <Text style={estilos.avatarLetra}>{nombre.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nombreCompleto}>
              {nombre} {apellido}
            </Text>
            <Text style={estilos.emailSub}>{email}</Text>
            <View style={estilos.badgeVerif}>
              {requisitosCompletos ? (
                <>
                  <CheckCircle2 color={COLOR.exito} size={14} />
                  <Text style={[estilos.badgeTexto, { color: COLOR.exito }]}>Anfitrión Verificado</Text>
                </>
              ) : (
                <>
                  <ShieldCheck color={COLOR.primario} size={14} />
                  <Text style={[estilos.badgeTexto, { color: COLOR.primario }]}>Verificación Legal en Trámite</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 2. Información Personal y de Contacto */}
      <View style={estilos.seccion}>
        <View style={estilos.seccionTituloFila}>
          <User color={COLOR.primario} size={18} />
          <Text style={estilos.seccionTitulo}>Información de Contacto</Text>
        </View>

        <Text style={estilos.label}>Nombre completo</Text>
        <View style={estilos.inputFila}>
          <User color={COLOR.textoSuave} size={18} />
          <TextInput
            style={estilos.input}
            value={`${nombre} ${apellido}`}
            editable={false}
            placeholderTextColor={COLOR.textoSuave}
          />
        </View>

        <Text style={estilos.label}>Correo Electrónico</Text>
        <View style={estilos.inputFila}>
          <Mail color={COLOR.textoSuave} size={18} />
          <TextInput
            style={estilos.input}
            value={email}
            editable={false}
            placeholderTextColor={COLOR.textoSuave}
          />
        </View>

        <Text style={estilos.label}>Teléfono WhatsApp (+591)</Text>
        <View style={estilos.inputFila}>
          <Phone color={COLOR.textoSuave} size={18} />
          <TextInput
            style={estilos.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="+591 77012345"
            placeholderTextColor={COLOR.textoSuave}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* 3. Verificación de Identidad Nacional (CI Boliviano) */}
      <View style={estilos.seccion}>
        <View style={estilos.seccionTituloFila}>
          <IdCard color={COLOR.primario} size={18} />
          <Text style={estilos.seccionTitulo}>Cédula de Identidad (SEGIP)</Text>
        </View>
        <Text style={estilos.subtituloAviso}>
          Requerido para la emisión de contratos de hospedaje y garantías de seguridad.
        </Text>

        <View style={estilos.filaCi}>
          <View style={{ flex: 2 }}>
            <Text style={estilos.label}>Número de CI</Text>
            <View style={estilos.inputFila}>
              <FileText color={COLOR.textoSuave} size={18} />
              <TextInput
                style={estilos.input}
                value={ci}
                onChangeText={setCi}
                placeholder="5829104"
                placeholderTextColor={COLOR.textoSuave}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.label}>Expedido</Text>
            <Pressable style={estilos.selectorExpedido} onPress={() => setModalExpedido(true)}>
              <Text style={estilos.selectorTexto}>{ciExpedido}</Text>
            </Pressable>
          </View>
        </View>

        {/* Fotos Anverso y Reverso */}
        <Text style={[estilos.label, { marginTop: ESPACIO.m }]}>Fotografías de Carnet de Identidad</Text>
        <View style={estilos.gridFotos}>
          {/* Anverso */}
          <View style={estilos.columnaFoto}>
            <Text style={estilos.labelFoto}>CI Anverso (Frente)</Text>
            {ciAnverso ? (
              <View style={estilos.contenedorMiniatura}>
                <Image source={{ uri: ciAnverso }} style={estilos.miniatura} resizeMode="cover" />
                <Pressable
                  style={estilos.botonCambiarFoto}
                  onPress={() => void seleccionarFoto('ciAnverso')}
                >
                  <Camera color={COLOR.blanco} size={14} />
                  <Text style={estilos.textoCambiarFoto}>Cambiar</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={estilos.cajaSubirFoto}
                onPress={() => void seleccionarFoto('ciAnverso')}
              >
                <Upload color={COLOR.primario} size={22} />
                <Text style={estilos.textoSubirFoto}>Subir Anverso</Text>
              </Pressable>
            )}
          </View>

          {/* Reverso */}
          <View style={estilos.columnaFoto}>
            <Text style={estilos.labelFoto}>CI Reverso (Atrás)</Text>
            {ciReverso ? (
              <View style={estilos.contenedorMiniatura}>
                <Image source={{ uri: ciReverso }} style={estilos.miniatura} resizeMode="cover" />
                <Pressable
                  style={estilos.botonCambiarFoto}
                  onPress={() => void seleccionarFoto('ciReverso')}
                >
                  <Camera color={COLOR.blanco} size={14} />
                  <Text style={estilos.textoCambiarFoto}>Cambiar</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={estilos.cajaSubirFoto}
                onPress={() => void seleccionarFoto('ciReverso')}
              >
                <Upload color={COLOR.primario} size={22} />
                <Text style={estilos.textoSubirFoto}>Subir Reverso</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* 4. Cuenta Bancaria y QR Oficial de Cobros */}
      <View style={estilos.seccion}>
        <View style={estilos.seccionTituloFila}>
          <CreditCard color={COLOR.primario} size={18} />
          <Text style={estilos.seccionTitulo}>Cuenta Bancaria y QR de Cobro</Text>
        </View>
        <Text style={estilos.subtituloAviso}>
          Donde recibirás los desembolsos de tus reservas y el QR que verán los huéspedes para pagar.
        </Text>

        <Text style={estilos.label}>Entidad Financiera</Text>
        <Pressable style={estilos.selectorBanco} onPress={() => setModalBancos(true)}>
          <Building2 color={COLOR.primario} size={18} />
          <Text style={estilos.selectorBancoTexto} numberOfLines={1}>
            {bancoNombre}
          </Text>
        </Pressable>

        <Text style={estilos.label}>Número de Cuenta</Text>
        <View style={estilos.inputFila}>
          <CreditCard color={COLOR.textoSuave} size={18} />
          <TextInput
            style={estilos.input}
            value={numeroCuenta}
            onChangeText={setNumeroCuenta}
            placeholder="Ej. 4010987654321"
            placeholderTextColor={COLOR.textoSuave}
            keyboardType="numeric"
          />
        </View>

        {/* QR de Cobro */}
        <Text style={[estilos.label, { marginTop: ESPACIO.m }]}>QR de Cobro Simple (Bancario)</Text>
        <View style={estilos.cajaQr}>
          {qrUri ? (
            <View style={estilos.qrPreviewContenedor}>
              <Image source={{ uri: qrUri }} style={estilos.qrPreview} resizeMode="contain" />
              <Pressable
                style={estilos.botonCargarQr}
                onPress={() => void seleccionarFoto('qr')}
              >
                <QrCode color={COLOR.primario} size={16} />
                <Text style={estilos.botonCargarQrTexto}>Reemplazar Imagen QR</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={estilos.qrVacio} onPress={() => void seleccionarFoto('qr')}>
              <QrCode color={COLOR.primario} size={36} />
              <Text style={estilos.qrVacioTitulo}>Cargar QR de Cobro</Text>
              <Text style={estilos.qrVacioSub}>Sube la captura de tu QR Simple BNB, BMSC, BCP o Banco Unión</Text>
            </Pressable>
          )}
        </View>

        {/* Botón Guardar */}
        <View style={{ marginTop: ESPACIO.l }}>
          <Boton
            titulo="Guardar Datos Bancarios"
            onPress={() => void guardarCambios()}
            cargando={guardando}
            iconoIzquierda={(c) => <Save color={c} size={18} />}
          />
        </View>
      </View>

      {/* 5. Cerrar Sesión */}
      <View style={estilos.seccionCerrar}>
        <Boton
          variante="contorno"
          titulo="Cerrar sesión de Anfitrión"
          onPress={alCerrarSesion}
          iconoIzquierda={() => <LogOut color={COLOR.error} size={18} />}
        />
      </View>

      {/* Modal Seleccionar Banco */}
      <Modal visible={modalBancos} transparent animationType="fade">
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Selecciona tu Entidad Bancaria</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {BANCOS_BOLIVIA.map((b) => (
                <Pressable
                  key={b}
                  style={[estilos.modalItem, b === bancoNombre && estilos.modalItemActivo]}
                  onPress={() => {
                    setBancoNombre(b);
                    setModalBancos(false);
                  }}
                >
                  <Text
                    style={[
                      estilos.modalItemTexto,
                      b === bancoNombre && { color: COLOR.primario, ...FUENTE.semi },
                    ]}
                  >
                    {b}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={estilos.modalCerrar} onPress={() => setModalBancos(false)}>
              <Text style={estilos.modalCerrarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Expedido */}
      <Modal visible={modalExpedido} transparent animationType="fade">
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Departamento Expedido</Text>
            <View style={estilos.gridExpedidos}>
              {DEPARTAMENTOS_BOLIVIA.map((dep) => (
                <Pressable
                  key={dep}
                  style={[estilos.botonDep, dep === ciExpedido && estilos.botonDepActivo]}
                  onPress={() => {
                    setCiExpedido(dep);
                    setModalExpedido(false);
                  }}
                >
                  <Text
                    style={[
                      estilos.textoDep,
                      dep === ciExpedido && { color: COLOR.blanco, ...FUENTE.fuerte },
                    ]}
                  >
                    {dep}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ESPACIO.l,
    backgroundColor: COLOR.fondo,
  },
  textoCargando: {
    marginTop: ESPACIO.m,
    color: COLOR.textoSuave,
    ...FUENTE.normal,
  },
  scroll: {
    padding: ESPACIO.m,
    paddingBottom: 80,
  },
  tarjetaHeader: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    borderWidth: 1,
    borderColor: COLOR.borde,
    marginBottom: ESPACIO.m,
    ...SOMBRA_FLOTANTE,
  },
  filaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
  },
  avatarContenedor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOR.primario,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetra: {
    color: COLOR.blanco,
    fontSize: 26,
    ...FUENTE.fuerte,
  },
  nombreCompleto: {
    color: COLOR.texto,
    fontSize: 18,
    ...FUENTE.fuerte,
  },
  emailSub: {
    color: COLOR.textoSuave,
    fontSize: 13,
    marginTop: 2,
    ...FUENTE.normal,
  },
  badgeVerif: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeTexto: {
    fontSize: 11,
    ...FUENTE.semi,
  },
  seccion: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    borderWidth: 1,
    borderColor: COLOR.borde,
    marginBottom: ESPACIO.m,
    ...SOMBRA_FLOTANTE,
  },
  seccionTituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: ESPACIO.s,
  },
  seccionTitulo: {
    color: COLOR.texto,
    fontSize: 16,
    ...FUENTE.fuerte,
  },
  subtituloAviso: {
    color: COLOR.textoSuave,
    fontSize: 12,
    marginBottom: ESPACIO.m,
    ...FUENTE.normal,
  },
  label: {
    color: COLOR.texto,
    fontSize: 12,
    marginBottom: 4,
    marginTop: ESPACIO.s,
    ...FUENTE.semi,
  },
  inputFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLOR.fondo,
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.borde,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: COLOR.texto,
    fontSize: 14,
    ...FUENTE.normal,
  },
  filaCi: {
    flexDirection: 'row',
    gap: ESPACIO.s,
  },
  selectorExpedido: {
    backgroundColor: COLOR.fondo,
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.borde,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorTexto: {
    color: COLOR.primario,
    fontSize: 14,
    ...FUENTE.fuerte,
  },
  gridFotos: {
    flexDirection: 'row',
    gap: ESPACIO.s,
  },
  columnaFoto: {
    flex: 1,
  },
  labelFoto: {
    color: COLOR.textoSuave,
    fontSize: 11,
    marginBottom: 6,
    ...FUENTE.normal,
  },
  contenedorMiniatura: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLOR.borde,
    position: 'relative',
  },
  miniatura: {
    width: '100%',
    height: '100%',
  },
  botonCambiarFoto: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoCambiarFoto: {
    color: COLOR.blanco,
    fontSize: 10,
    ...FUENTE.semi,
  },
  cajaSubirFoto: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLOR.primario,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  textoSubirFoto: {
    color: COLOR.primario,
    fontSize: 11,
    ...FUENTE.semi,
  },
  selectorBanco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLOR.fondo,
    borderRadius: RADIO.control,
    borderWidth: 1,
    borderColor: COLOR.borde,
    paddingHorizontal: 12,
    height: 44,
  },
  selectorBancoTexto: {
    flex: 1,
    color: COLOR.texto,
    fontSize: 13,
    ...FUENTE.semi,
  },
  cajaQr: {
    marginTop: 6,
  },
  qrPreviewContenedor: {
    alignItems: 'center',
    padding: ESPACIO.s,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  qrPreview: {
    width: 170,
    height: 170,
    borderRadius: 8,
    backgroundColor: COLOR.blanco,
  },
  botonCargarQr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  botonCargarQrTexto: {
    color: COLOR.primario,
    fontSize: 12,
    ...FUENTE.semi,
  },
  qrVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACIO.l,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLOR.primario,
    backgroundColor: '#F8FAFC',
  },
  qrVacioTitulo: {
    marginTop: 6,
    color: COLOR.primario,
    fontSize: 14,
    ...FUENTE.fuerte,
  },
  qrVacioSub: {
    marginTop: 2,
    color: COLOR.textoSuave,
    fontSize: 11,
    textAlign: 'center',
    ...FUENTE.normal,
  },
  seccionCerrar: {
    marginTop: ESPACIO.s,
    marginBottom: ESPACIO.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: ESPACIO.l,
  },
  modalContenido: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.m,
    ...SOMBRA_FLOTANTE,
  },
  modalTitulo: {
    color: COLOR.texto,
    fontSize: 16,
    marginBottom: ESPACIO.m,
    ...FUENTE.fuerte,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borde,
  },
  modalItemActivo: {
    backgroundColor: '#F1F5F9',
  },
  modalItemTexto: {
    color: COLOR.texto,
    fontSize: 14,
    ...FUENTE.normal,
  },
  modalCerrar: {
    marginTop: ESPACIO.m,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCerrarTexto: {
    color: COLOR.primario,
    fontSize: 14,
    ...FUENTE.semi,
  },
  gridExpedidos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  botonDep: {
    width: 60,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLOR.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  botonDepActivo: {
    backgroundColor: COLOR.primario,
    borderColor: COLOR.primario,
  },
  textoDep: {
    color: COLOR.texto,
    fontSize: 14,
    ...FUENTE.semi,
  },
});
