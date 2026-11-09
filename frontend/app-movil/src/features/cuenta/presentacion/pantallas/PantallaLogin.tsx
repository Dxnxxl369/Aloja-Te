// ======================================================================
// ARCHIVO: cuenta/presentacion/pantallas/PantallaLogin.tsx      IMPORTANCIA: ★★ MEDIA
// QUÉ ES: La pantalla de inicio de sesión (correo + contraseña) del flujo de pantallas.
// PARA QUÉ SIRVE: Sin sesión no hay token ni usuario: el agente y los pagos lo necesitan.
// SIN ÉL: No se podría entrar a la app.
// NO VA AQUÍ: La lógica del login (eso es core/auth): recibe `alIniciar` y solo muestra el resultado.
// ======================================================================
// Diseño: mockup "1. Inicio de sesión". Los textos de error salen de AppError (core/base).

import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../../../../shared/ui/Boton';
import { Logo } from '../../../../shared/ui/Logo';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { estilos } from './PantallaLogin.styles';

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
          <Logo tamano={56} />
          <Text style={estilos.nombre}>
            Aloja<Text style={{ color: COLOR.primario }}>-Te</Text>
          </Text>
          <Text style={estilos.lema}>Plataforma Nacional de Alojamientos</Text>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Inicia sesión</Text>

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

          {error ? (
            <Text accessibilityRole="alert" style={estilos.error}>
              {error}
            </Text>
          ) : null}

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

        {/* Acceso Rápido para Pruebas de Roles */}
        <View style={estilosDemo.contenedorDemo}>
          <Text style={estilosDemo.tituloDemo}>ACCESO RÁPIDO PARA EVALUACIÓN</Text>
          <View style={estilosDemo.filaDemo}>
            <Pressable
              style={estilosDemo.botonDemo}
              onPress={() => {
                setEmail('cliente@alojate.bo');
                setPassword('Password123!');
              }}
            >
              <Text style={estilosDemo.rolDemo}>Huésped</Text>
              <Text style={estilosDemo.emailDemo}>cliente@alojate.bo</Text>
            </Pressable>

            <Pressable
              style={[estilosDemo.botonDemo, estilosDemo.botonDemoAnfitrion]}
              onPress={() => {
                setEmail('carlos.mendoza@alojate.bo');
                setPassword('Password123!');
              }}
            >
              <Text style={[estilosDemo.rolDemo, { color: COLOR.primario }]}>Anfitrión (Carlos BMSC)</Text>
              <Text style={estilosDemo.emailDemo}>carlos.mendoza@alojate.bo</Text>
            </Pressable>

            <Pressable
              style={[estilosDemo.botonDemo, estilosDemo.botonDemoAnfitrion]}
              onPress={() => {
                setEmail('danielqczn@gmail.com');
                setPassword('Password123!');
              }}
            >
              <Text style={[estilosDemo.rolDemo, { color: COLOR.primario }]}>Anfitrión (Daniel)</Text>
              <Text style={estilosDemo.emailDemo}>danielqczn@gmail.com</Text>
            </Pressable>
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

const estilosDemo = StyleSheet.create({
  contenedorDemo: {
    padding: ESPACIO.m,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.borde,
    gap: 8,
  },
  tituloDemo: {
    fontSize: 10,
    color: COLOR.textoSuave,
    letterSpacing: 0.8,
    textAlign: 'center',
    fontWeight: '700',
  },
  filaDemo: {
    gap: 6,
  },
  botonDemo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonDemoAnfitrion: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  rolDemo: {
    fontSize: 12,
    color: COLOR.texto,
    fontWeight: '600',
  },
  emailDemo: {
    fontSize: 11,
    color: COLOR.textoSuave,
  },
});
