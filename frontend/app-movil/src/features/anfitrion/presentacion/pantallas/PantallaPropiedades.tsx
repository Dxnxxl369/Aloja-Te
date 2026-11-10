// ======================================================================
// ARCHIVO: anfitrion/presentacion/pantallas/PantallaPropiedades.tsx
// QUÉ ES: Catálogo de alojamientos del anfitrión con alta, edición y moderación inteligente.
// ======================================================================

import { Building2, Plus, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSesion } from '../../../../core';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { PropiedadAnfitrion } from '../../domain/modelos';
import { ModalCrearPropiedad } from '../componentes/ModalCrearPropiedad';
import { ModalEditarPropiedad } from '../componentes/ModalEditarPropiedad';
import { TarjetaPropiedad } from '../componentes/TarjetaPropiedad';

interface Props {
  repo: {
    obtenerPropiedades: (anfitrionId: string) => Promise<PropiedadAnfitrion[]>;
    crearPropiedad: (anfitrionId: string, datos: any) => Promise<any>;
    actualizarPropiedad: (idAlojamiento: string, datos: any) => Promise<any>;
    crearUnidad?: (idAlojamiento: string, datos: any) => Promise<any>;
  };
}

export function PantallaPropiedades({ repo }: Props) {
  const insets = useSafeAreaInsets();
  const { sesion } = useSesion();
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [propiedades, setPropiedades] = useState<PropiedadAnfitrion[]>([]);

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<PropiedadAnfitrion | null>(null);

  const anfitrionId = sesion?.usuarioId || '7c772f61-90f1-474a-8acf-e7ba66e20d40';

  const cargar = useCallback(async () => {
    if (!anfitrionId) return;
    try {
      const lista = await repo.obtenerPropiedades(anfitrionId);
      setPropiedades(lista);
    } catch (e) {
      console.warn('Error al cargar propiedades:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [repo, anfitrionId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const onRefresh = () => {
    setRefrescando(true);
    void cargar();
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={[estilos.contenedor, { paddingTop: insets.top + ESPACIO.m }]}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[COLOR.primario]} />}
      >
        <View style={estilos.cabecera}>
          <View>
            <Text style={estilos.titulo}>Mis Propiedades</Text>
            <Text style={estilos.subtitulo}>
              {propiedades.length} {propiedades.length === 1 ? 'alojamiento registrado' : 'alojamientos registrados'}
            </Text>
          </View>

          <Pressable
            onPress={() => setModalCrear(true)}
            style={estilos.botonNuevo}
            accessibilityRole="button"
            accessibilityLabel="Crear nuevo alojamiento"
          >
            <Plus color="#ffffff" size={18} strokeWidth={2.4} />
            <Text style={estilos.textoBotonNuevo}>Nueva</Text>
          </Pressable>
        </View>

        {cargando && propiedades.length === 0 ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLOR.primario} size="large" />
          </View>
        ) : propiedades.length === 0 ? (
          <View style={estilos.cajaVacia}>
            <Building2 color={COLOR.textoSuave} size={36} />
            <Text style={estilos.tituloVacio}>No tienes propiedades aún</Text>
            <Text style={estilos.textoVacio}>
              Registra tu primer alojamiento para comenzar a recibir reservas verídicas.
            </Text>
            <Pressable onPress={() => setModalCrear(true)} style={[estilos.botonNuevo, { marginTop: ESPACIO.m }]}>
              <Plus color="#ffffff" size={18} />
              <Text style={estilos.textoBotonNuevo}>Publicar Alojamiento</Text>
            </Pressable>
          </View>
        ) : (
          propiedades.map((p) => (
            <TarjetaPropiedad
              key={p.id}
              propiedad={p}
              onPress={() => setPropiedadSeleccionada(p)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal Crear Propiedad */}
      <ModalCrearPropiedad
        visible={modalCrear}
        onClose={() => setModalCrear(false)}
        anfitrionId={anfitrionId}
        onCreado={() => {
          setRefrescando(true);
          void cargar();
        }}
        repo={repo}
      />

      {/* Modal Editar Propiedad */}
      <ModalEditarPropiedad
        visible={!!propiedadSeleccionada}
        onClose={() => setPropiedadSeleccionada(null)}
        propiedad={propiedadSeleccionada}
        onActualizado={() => {
          setRefrescando(true);
          void cargar();
        }}
        repo={repo}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLOR.fondo,
  },
  scroll: {
    flex: 1,
  },
  contenedor: {
    padding: ESPACIO.m,
    paddingBottom: 90,
    gap: ESPACIO.m,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACIO.xs,
  },
  titulo: {
    ...FUENTE.tituloFuerte,
    fontSize: 22,
    color: COLOR.texto,
  },
  subtitulo: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
  },
  botonNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLOR.primario,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIO.pildora,
  },
  textoBotonNuevo: {
    ...FUENTE.semi,
    fontSize: TAMANO.pequeno,
    color: '#ffffff',
  },
  centro: {
    padding: ESPACIO.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaVacia: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
    padding: ESPACIO.xl,
    alignItems: 'center',
    gap: ESPACIO.s,
    marginTop: ESPACIO.l,
  },
  tituloVacio: {
    ...FUENTE.tituloFuerte,
    fontSize: 16,
    color: COLOR.texto,
  },
  textoVacio: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
    textAlign: 'center',
    lineHeight: 20,
  },
});
