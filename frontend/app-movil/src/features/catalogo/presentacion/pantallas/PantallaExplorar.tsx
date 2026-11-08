// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaExplorar.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La pantalla de inicio: buscador, ciudades, destacados, tipos de propiedad y la lista de alojamientos.
// PARA QUÉ SIRVE: Es donde el usuario descubre alojamientos antes de reservar (con el asistente o a mano).
// SIN ÉL: La app abriría directo en el asistente, sin forma de explorar.
// NO VA AQUÍ: Cargar datos ni reglas de filtrado (useCatalogo y domain/casos.ts) ni navegar: solo avisa.
// ======================================================================
// Diseño: mockup "Explorar y buscar alojamientos". Solo se dibuja lo que MS-01 entrega: sin reseñas no hay
// "Destacados", sin tipos no hay "Explora por tipo".

import { BadgeCheck, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { Chip } from '../../../../shared/ui/Chip';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import { TarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import type { CasosCatalogo } from '../../domain/interfaces';
import { BannerReservaProtegida } from '../componentes/BannerReservaProtegida';
import { BotonAsistente } from '../componentes/BotonAsistente';
import { BuscadorAlojamientos } from '../componentes/BuscadorAlojamientos';
import { FiltrosSheet } from '../componentes/FiltrosSheet';
import { TiposAlojamiento } from '../componentes/TiposAlojamiento';
import { datosTarjeta } from '../datosTarjeta';
import { useCatalogo } from '../useCatalogo';

interface Props {
  casos: CasosCatalogo;
  alVer: (datos: DatosTarjetaAlojamiento) => void;
  alReservar: (datos: DatosTarjetaAlojamiento) => void;
  alAbrirAsistente: () => void;
  /** true si el modelo de IA local está cargado (cambia el texto de la burbuja). */
  iaLista: boolean;
}

export function PantallaExplorar({ casos, alVer, alReservar, alAbrirAsistente, iaLista }: Props) {
  const c = useCatalogo(casos);
  const { width } = useWindowDimensions();
  const [verFiltros, setVerFiltros] = useState(false);

  // La tarjeta destacada deja asomar un pedazo de la siguiente para que se note que hay más.
  const anchoDestacada = Math.min(width - ESPACIO.l * 2 - 28, 380);
  const filtrosServidorActivos = c.filtrosServidor.precioMax !== undefined || c.filtrosServidor.huespedes !== undefined;

  const sinNada = c.cargando && !c.hayAlojamientos;
  const falloTotal = !!c.error && !c.hayAlojamientos;

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.pagina}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={c.cargando && c.hayAlojamientos} onRefresh={c.recargar} colors={[COLOR.primario]} />}
      >
        <View style={{ gap: ESPACIO.xs }}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Alojamientos Disponibles en Bolivia
          </Text>
          <Text style={estilos.subtitulo}>Propiedades verificadas con bloqueo de inventario en tiempo real</Text>
          {c.desdeCache ? <Text style={estilos.avisoCache}>Sin conexión: se muestra lo último guardado.</Text> : null}
        </View>

        <BuscadorAlojamientos
          texto={c.texto}
          alCambiarTexto={c.setTexto}
          alAbrirFiltros={() => setVerFiltros(true)}
          filtrosActivos={filtrosServidorActivos}
        />

        {c.ciudades.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
            <View style={estilos.etiquetaFiltro} accessible accessibilityLabel="Filtrar por ciudad">
              <SlidersHorizontal color={COLOR.textoSuave} size={16} />
              <Text style={estilos.etiquetaFiltroTexto}>Filtro:</Text>
            </View>
            <Chip etiqueta="Todos" seleccionado={c.ciudad === null} estiloSeleccionado="solido" onPress={() => c.setCiudad(null)} />
            {c.ciudades.map((nombre) => (
              <Chip
                key={nombre}
                etiqueta={nombre}
                seleccionado={c.ciudad === nombre}
                estiloSeleccionado="solido"
                onPress={() => c.setCiudad(c.ciudad === nombre ? null : nombre)}
              />
            ))}
          </ScrollView>
        )}

        {sinNada ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLOR.primario} size="large" />
            <Text style={estilos.suave}>Buscando alojamientos…</Text>
          </View>
        ) : falloTotal ? (
          <View style={estilos.centro}>
            <Text accessibilityRole="alert" style={estilos.error}>
              {c.error}
            </Text>
            <Boton titulo="Reintentar" onPress={c.recargar} />
          </View>
        ) : (
          <>
            {c.error ? (
              <Text accessibilityRole="alert" style={estilos.error}>
                No se pudo actualizar: {c.error}
              </Text>
            ) : null}

            {c.filtrados.length === 0 && (
              <View style={estilos.vacio}>
                <Text style={estilos.vacioTitulo}>No encontramos alojamientos</Text>
                <Text style={estilos.suave}>
                  {c.hayFiltros ? 'Prueba con otra búsqueda o quita los filtros.' : 'Todavía no hay alojamientos publicados.'}
                </Text>
                {c.hayFiltros ? <Boton variante="contorno" titulo="Quitar filtros" onPress={c.limpiarFiltros} /> : null}
              </View>
            )}

            {c.destacados.length > 0 && (
              <Seccion
                titulo="Destacados"
                icono={<BadgeCheck color={COLOR.primario} size={22} />}
                derecha={`${c.destacados.length} ${c.destacados.length === 1 ? 'DISPONIBLE' : 'DISPONIBLES'}`}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={anchoDestacada + ESPACIO.m}
                  decelerationRate="fast"
                  contentContainerStyle={{ gap: ESPACIO.m }}
                  style={estilos.carrusel}
                >
                  {c.destacados.map((a) => {
                    const datos = datosTarjeta(a);
                    return (
                      <TarjetaAlojamiento
                        key={a.id}
                        datos={datos}
                        variante="destacada"
                        ancho={anchoDestacada}
                        alVer={() => alVer(datos)}
                        alReservar={() => alReservar(datos)}
                      />
                    );
                  })}
                </ScrollView>
              </Seccion>
            )}

            {c.tipos.length > 0 && (
              <Seccion titulo="Explora por tipo">
                <TiposAlojamiento tipos={c.tipos} seleccionado={c.tipoId} alElegir={c.setTipoId} />
              </Seccion>
            )}

            <BannerReservaProtegida />

            {c.resto.length > 0 && (
              <Seccion titulo={c.destacados.length > 0 ? 'Más alojamientos en Bolivia' : 'Alojamientos en Bolivia'}>
                <View style={{ gap: ESPACIO.m }}>
                  {c.resto.map((a) => {
                    const datos = datosTarjeta(a);
                    return <TarjetaAlojamiento key={a.id} datos={datos} variante="lista" alVer={() => alVer(datos)} />;
                  })}
                </View>
              </Seccion>
            )}
          </>
        )}
      </ScrollView>

      <BotonAsistente alPresionar={alAbrirAsistente} iaLista={iaLista} />

      <FiltrosSheet
        visible={verFiltros}
        valor={c.filtrosServidor}
        alCerrar={() => setVerFiltros(false)}
        alAplicar={c.setFiltrosServidor}
      />
    </View>
  );
}

function Seccion({ titulo, icono, derecha, children }: { titulo: string; icono?: ReactNode; derecha?: string; children: ReactNode }) {
  return (
    <View style={{ gap: ESPACIO.m }}>
      <View style={estilos.seccionCabecera}>
        <View style={estilos.seccionTitulo}>
          {icono}
          <Text style={estilos.seccionTexto} accessibilityRole="header">
            {titulo}
          </Text>
        </View>
        {derecha ? <Text style={estilos.seccionDerecha}>{derecha}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  // El pie deja sitio al botón flotante del asistente.
  pagina: { padding: ESPACIO.l, gap: ESPACIO.xl, paddingBottom: 104 },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 28, lineHeight: 36, color: COLOR.texto },
  subtitulo: { fontFamily: FUENTE.normal, fontSize: 14, lineHeight: 20, color: COLOR.textoSuave },
  avisoCache: { fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.aviso },

  chips: { gap: ESPACIO.s, alignItems: 'center' },
  etiquetaFiltro: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.xs,
    paddingHorizontal: 14,
    borderRadius: RADIO.pildora,
    backgroundColor: COLOR.campo,
  },
  etiquetaFiltroTexto: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.textoSuave },

  centro: { alignItems: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.xxl },
  suave: { fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave, textAlign: 'center' },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, textAlign: 'center' },
  vacio: { alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.xl, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  vacioTitulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto, textAlign: 'center' },

  seccionCabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seccionTitulo: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s, flexShrink: 1 },
  seccionTexto: { fontFamily: FUENTE.titulo, fontSize: 24, color: COLOR.texto },
  seccionDerecha: { fontFamily: FUENTE.semi, fontSize: 12, letterSpacing: 0.6, color: COLOR.primario },
  // Las tarjetas llegan hasta el borde de la pantalla al deslizar.
  carrusel: { marginHorizontal: -ESPACIO.l, paddingHorizontal: ESPACIO.l },
});
