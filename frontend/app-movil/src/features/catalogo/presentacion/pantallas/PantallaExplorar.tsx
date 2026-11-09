// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaExplorar.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La pantalla de inicio: buscador, destacados en carrusel y la lista de alojamientos.
// PARA QUÉ SIRVE: Es donde el usuario descubre alojamientos; para reservar abre la ficha del alojamiento.
// SIN ÉL: La app abriría directo en el agente, sin forma de explorar.
// NO VA AQUÍ: Cargar datos ni reglas de filtrado (useCatalogo y domain/casos.ts) ni navegar: solo avisa.
// ======================================================================
// La ciudad, el precio y los huéspedes se eligen en la hoja de filtros (botón junto al buscador): no hay
// fila de ciudades ni "Explora por tipo". Las tarjetas son compactas; el detalle completo está en la ficha.

import { BadgeCheck } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Boton } from '../../../../shared/ui/Boton';
import { COLOR, ESPACIO } from '../../../../shared/ui/tema';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import { TarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import { FEATURED_CAROUSEL } from '../../constantes';
import type { CasosCatalogo } from '../../domain/interfaces';
import { BannerReservaProtegida } from '../componentes/BannerReservaProtegida';
import { BuscadorAlojamientos } from '../componentes/BuscadorAlojamientos';
import { EsqueletoExplorar } from '../componentes/EsqueletoExplorar';
import { FiltrosSheet } from '../componentes/FiltrosSheet';
import { datosTarjeta } from '../datosTarjeta';
import { useCatalogo } from '../useCatalogo';
import { estilos } from './PantallaExplorar.styles';

interface Props {
  casos: CasosCatalogo;
  /** El usuario tocó un alojamiento: abre su ficha. */
  alVer: (datos: DatosTarjetaAlojamiento) => void;
}

export function PantallaExplorar({ casos, alVer }: Props) {
  const c = useCatalogo(casos);
  const { width } = useWindowDimensions();
  const [verFiltros, setVerFiltros] = useState(false);

  // Tarjetas delgadas: algo más de la mitad de la pantalla, así se asoma la siguiente y se nota que hay más.
  const anchoDestacada = Math.min(Math.round(width * FEATURED_CAROUSEL.WIDTH_RATIO), FEATURED_CAROUSEL.MAX_WIDTH);
  const intervalo = anchoDestacada + FEATURED_CAROUSEL.GAP;

  // `alVer` llega como función nueva en cada dibujo; esta versión es siempre la misma para que las tarjetas no se redibujen.
  const verRef = useRef(alVer);
  verRef.current = alVer;
  const ver = useCallback((datos: DatosTarjetaAlojamiento) => verRef.current(datos), []);

  const datosDestacados = useMemo(() => c.destacados.map(datosTarjeta), [c.destacados]);
  // La lista de abajo muestra TODOS los que cumplen la búsqueda; el carrusel solo resalta los mejor calificados.
  const datosTodos = useMemo(() => c.filtrados.map(datosTarjeta), [c.filtrados]);

  const renderDestacada = useCallback(
    ({ item }: { item: DatosTarjetaAlojamiento }) => <TarjetaAlojamiento datos={item} variante="destacada" ancho={anchoDestacada} alVer={ver} />,
    [anchoDestacada, ver],
  );
  const claveDe = useCallback((item: DatosTarjetaAlojamiento) => item.id, []);
  const medida = useCallback((_: ArrayLike<DatosTarjetaAlojamiento> | null | undefined, index: number) => ({ length: intervalo, offset: intervalo * index, index }), [intervalo]);

  const filtrosActivos =
    c.filtrosServidor.precioMax !== undefined || c.filtrosServidor.huespedes !== undefined || c.ciudad !== null;

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
            Alojamientos en Bolivia
          </Text>
          {c.desdeCache ? <Text style={estilos.avisoCache}>Sin conexión: se muestra lo último guardado.</Text> : null}
        </View>

        <BuscadorAlojamientos
          texto={c.texto}
          alCambiarTexto={c.setTexto}
          alAbrirFiltros={() => setVerFiltros(true)}
          filtrosActivos={filtrosActivos}
        />

        {sinNada ? (
          <EsqueletoExplorar anchoTarjeta={anchoDestacada} />
        ) : falloTotal ? (
          <View style={estilos.centro}>
            <Text accessibilityRole="alert" style={estilos.error}>
              {c.error}
            </Text>
            <Boton titulo={COMMON_TEXT.RETRY} onPress={c.recargar} />
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

            {datosDestacados.length > 0 && (
              <Seccion titulo="Destacados" icono={<BadgeCheck color={COLOR.primario} size={22} />}>
                <FlatList
                  horizontal
                  data={datosDestacados}
                  renderItem={renderDestacada}
                  keyExtractor={claveDe}
                  getItemLayout={medida}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={intervalo}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  ItemSeparatorComponent={Separador}
                  contentContainerStyle={estilos.carruselContenido}
                  style={estilos.carrusel}
                  initialNumToRender={FEATURED_CAROUSEL.INITIAL_RENDER}
                  maxToRenderPerBatch={FEATURED_CAROUSEL.BATCH}
                  windowSize={FEATURED_CAROUSEL.WINDOW}
                  removeClippedSubviews
                />
              </Seccion>
            )}

            {datosTodos.length > 0 && (
              <Seccion titulo="Todos los alojamientos">
                <View style={{ gap: ESPACIO.s }}>
                  {datosTodos.map((d) => (
                    <TarjetaAlojamiento key={d.id} datos={d} variante="lista" alVer={ver} />
                  ))}
                </View>
              </Seccion>
            )}

            <BannerReservaProtegida />
          </>
        )}
      </ScrollView>

      <FiltrosSheet
        visible={verFiltros}
        valor={c.filtrosServidor}
        ciudades={c.ciudades}
        ciudad={c.ciudad}
        alCerrar={() => setVerFiltros(false)}
        alAplicar={(filtros, ciudad) => {
          c.setFiltrosServidor(filtros);
          c.setCiudad(ciudad);
        }}
      />
    </View>
  );
}

function Separador() {
  return <View style={{ width: FEATURED_CAROUSEL.GAP }} />;
}

function Seccion({ titulo, icono, children }: { titulo: string; icono?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: ESPACIO.m }}>
      <View style={estilos.seccionTitulo}>
        {icono}
        <Text style={estilos.seccionTexto} accessibilityRole="header">
          {titulo}
        </Text>
      </View>
      {children}
    </View>
  );
}
