// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaLogin.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de inicio de sesión (correo + contraseña) del flujo de pantallas.
// PARA QUÉ SIRVE: Sin sesión no hay token ni usuario: el agente y los pagos lo necesitan.
// SIN ÉL: No se podría entrar a la app.
// NO VA AQUÍ: La lógica del login (eso es core/auth): recibe `alIniciar` y solo muestra el resultado.
// ======================================================================
// Diseño: mockup "1. Inicio de sesión". Los textos de error salen de AppError (core/base).

import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sun } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Insignia } from '../../../../shared/ui/Insignia';
import { COLOR, ESPACIO, FUENTE, RADIO, SOMBRA_FLOTANTE } from '../../../../shared/ui/tema';

interface Props {
  /** Debe lanzar un Error con mensaje apto para el usuario si falla. */
  alIniciar: (email: string, password: string) => Promise<void>;
}

export function PantallaLogin({ alIniciar }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listo = email.trim().length > 0 && password.length > 0;

  const entrar = async () => {
    if (!listo || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await alIniciar(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
      setEnviando(false);
    }
    // Si sale bien, la raíz de la app cambia de pantalla: no hace falta apagar `enviando`.
  };

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[estilos.contenido, { paddingTop: insets.top + ESPACIO.xxl, paddingBottom: insets.bottom + ESPACIO.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.marca}>
          <View style={estilos.logo}>
            <Sun color="#fff" size={34} />
          </View>
          <View style={estilos.nombreFila}>
            <Text style={estilos.nombre}>
              Aloja<Text style={{ color: COLOR.primario }}>-Te</Text>
            </Text>
            <Insignia texto="BOLIVIA" />
          </View>
          <Text style={estilos.lema}>Plataforma Nacional de Alojamientos</Text>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Inicia sesión</Text>
          <Text style={estilos.subtitulo}>Entra para reservar con el asistente.</Text>

          <Text style={estilos.etiqueta}>Correo Electrónico</Text>
          <View style={estilos.campo}>
            <Mail color={COLOR.textoSuave} size={20} />
            <TextInput
              style={estilos.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@alojate.bo"
              placeholderTextColor={COLOR.textoSuave}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!enviando}
            />
          </View>

          <Text style={estilos.etiqueta}>Contraseña</Text>
          <View style={estilos.campo}>
            <Lock color={COLOR.textoSuave} size={20} />
            <TextInput
              style={estilos.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLOR.textoSuave}
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              editable={!enviando}
              onSubmitEditing={() => void entrar()}
              returnKeyType="go"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onPress={() => setVerPassword((v) => !v)}
              hitSlop={10}
            >
              {verPassword ? <EyeOff color={COLOR.textoSuave} size={20} /> : <Eye color={COLOR.textoSuave} size={20} />}
            </Pressable>
          </View>

          {error && (
            <Text accessibilityRole="alert" style={estilos.error}>
              {error}
            </Text>
          )}

          <View style={{ marginTop: ESPACIO.l }}>
            <Boton
              titulo="Iniciar Sesión"
              onPress={() => void entrar()}
              cargando={enviando}
              deshabilitado={!listo}
              iconoDerecha={(c) => <ArrowRight color={c} size={20} />}
            />
          </View>
        </View>

        <View style={estilos.seguro}>
          <ShieldCheck color={COLOR.textoSuave} size={16} />
          <Text style={estilos.seguroTexto}>Conexión cifrada de alta seguridad</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  contenido: { paddingHorizontal: ESPACIO.xl, gap: ESPACIO.xl, flexGrow: 1 },

  marca: { alignItems: 'center', gap: ESPACIO.s },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLOR.primario, alignItems: 'center', justifyContent: 'center', ...SOMBRA_FLOTANTE },
  nombreFila: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, marginTop: ESPACIO.s },
  nombre: { fontFamily: FUENTE.tituloFuerte, fontSize: 32, color: COLOR.texto },
  lema: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },

  tarjeta: { backgroundColor: COLOR.tarjeta, borderRadius: 20, padding: ESPACIO.xl, ...SOMBRA_FLOTANTE },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 26, color: COLOR.texto },
  subtitulo: { fontFamily: FUENTE.normal, fontSize: 15, color: COLOR.textoSuave, marginTop: ESPACIO.xs, marginBottom: ESPACIO.l },
  etiqueta: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.texto, marginTop: ESPACIO.m, marginBottom: ESPACIO.s },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    minHeight: 52,
    paddingHorizontal: ESPACIO.l,
    borderRadius: RADIO.control,
    backgroundColor: COLOR.campo,
  },
  input: { flex: 1, fontFamily: FUENTE.normal, fontSize: 16, color: COLOR.texto, paddingVertical: ESPACIO.m },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, marginTop: ESPACIO.m },

  seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.s },
  seguroTexto: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.textoSuave, letterSpacing: 0.3 },
});
