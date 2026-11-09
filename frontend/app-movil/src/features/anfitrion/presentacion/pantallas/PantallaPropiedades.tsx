// ======================================================================
// ARCHIVO: anfitrion/presentacion/pantallas/PantallaPropiedades.tsx
// QUÉ ES: Catálogo de mis alojamientos como anfitrión con sus estados de moderación.
// ======================================================================

import { Building2, Plus, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSesion } from '../../../../core';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../shared/ui/tema';
import type { PropiedadAnfitrion } from '../../domain/modelos';
import { TarjetaPropiedad } from '../componentes/TarjetaPropiedad';

interface Props {
  repo: {
    obtenerPropiedades: (anfitrionId: string) => Promise<PropiedadAnfitrion[]>;
  };
}

export function PantallaPropiedades({ repo }: Props) {
  const insets = useSafeAreaInsets();
  const { sesion } = useSesion();
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [propiedades, setPropiedades] = useState<PropiedadAnfitrion[]>([]);

  const cargar = useCallback(async () => {
    if (!sesion?.usuarioId) return;
    try {
      const lista = await repo.obtenerPropiedades(sesion.usuarioId);
      setPropiedades(lista);
    } catch (e) {
      console.warn('Error al cargar propiedades:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [repo, sesion?.usuarioId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const onRefresh = () => {
    setRefrescando(true);
    void cargar();
  };

  return (
    <ScrollView
      style={estilos.pantalla}
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
            Tus propiedades publicadas o en revisión aparecerán listadas aquí con su estado de moderación.
          </Text>
        </View>
      ) : (
        propiedades.map((p) => <TarjetaPropiedad key={p.id} propiedad={p} />)
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLOR.fondo,
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
  centro: {
    padding: ESPACIO.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaVacia: {
    backgroundColor: COLOR.tarjeta,
    borderRadius: RADIO.tarjeta,
    padding: ESPACIO.xl,
    alignItems: 'center',
    gap: ESPACIO.s,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  tituloVacio: {
    ...FUENTE.titulo,
    fontSize: TAMANO.subtitulo,
    color: COLOR.texto,
  },
  textoVacio: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
    textAlign: 'center',
  },
});
