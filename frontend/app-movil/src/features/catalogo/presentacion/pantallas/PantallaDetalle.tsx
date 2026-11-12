// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaDetalle.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La ficha de un alojamiento: fotos, encabezado, habitaciones, ubicación, sobre este alojamiento, políticas y opiniones reales.
// ======================================================================

import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BarraReserva } from '../../../../shared/ui/BarraReserva';
import { Boton } from '../../../../shared/ui/Boton';
import { formatearPrecio } from '../../../../shared/ui/dinero';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import type { CasosCatalogo } from '../../domain/interfaces';
import type { UnidadCatalogo } from '../../domain/modelos';
import { CarruselFotos } from '../componentes/CarruselFotos';
import { EsqueletoDatosRapidos, EsqueletoServicios } from '../componentes/ficha/EsqueletoFicha';
import { FichaDatosRapidos } from '../componentes/ficha/FichaDatosRapidos';
import { FichaEncabezado } from '../componentes/ficha/FichaEncabezado';
import { FichaHabitacionesDisponibles } from '../componentes/ficha/FichaHabitacionesDisponibles';
import { FichaOpinionesHuespedes } from '../componentes/ficha/FichaOpinionesHuespedes';
import { FichaPoliticas } from '../componentes/ficha/FichaPoliticas';
import { FichaSobreYServicios } from '../componentes/ficha/FichaSobreYServicios';
import { FichaUbicacion } from '../componentes/ficha/FichaUbicacion';
import { unir } from '../componentes/ficha/texto';
import { OpcionesReservaSheet } from '../componentes/OpcionesReservaSheet';
import { useDetalle } from '../useDetalle';
import { estilos } from './PantallaDetalle.styles';

interface Props {
  casos: CasosCatalogo;
  /** Lo que ya sabe la tarjeta: se muestra mientras llega el detalle. */
  datos: DatosTarjetaAlojamiento;
  /** Reservar llenando los datos a mano. */
  alReservarManual: () => void;
  /** Reservar con el agente sobre este alojamiento (opción de la hoja que sale al tocar "Reservar"). */
  alAsistente: () => void;
}

export function PantallaDetalle({ casos, datos, alReservarManual, alAsistente }: Props) {
  const { detalle, valoraciones, cargando, error, recargar } = useDetalle(casos, datos.id);
  const [eligiendo, setEligiendo] = useState(false);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadCatalogo | null>(null);

  // Lo que hay primero (tarjeta) se reemplaza por lo completo (detalle) cuando llega.
  const titulo = detalle?.titulo ?? datos.titulo;
  const calificacion = detalle ? detalle.calificacion : datos.calificacion;
  const totalResenas = detalle ? detalle.totalResenas : datos.totalResenas;
  const precio = unidadSeleccionada ? unidadSeleccionada.precioNoche : detalle ? detalle.precioDesde : (datos.precioNoche ?? null);
  const fotos = detalle && detalle.fotos.length > 0 ? detalle.fotos : datos.fotoUrl ? [datos.fotoUrl] : [];
  const ciudad = detalle?.ciudad ?? datos.ciudad;
  const departamento = detalle?.departamento ?? datos.departamento;
  const lugarCorto = unir([ciudad, departamento], ' · ');

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.pagina}>
        <CarruselFotos fotos={fotos} titulo={titulo} lugar={lugarCorto || undefined} verificado={datos.verificado} />

        <View style={estilos.cuerpo}>
          <FichaEncabezado tipo={detalle?.tipo ?? datos.tipo} titulo={titulo} calificacion={calificacion} totalResenas={totalResenas} />

          <FichaUbicacion
            ciudad={ciudad}
            departamento={departamento}
            direccion={detalle?.direccion}
            latitud={detalle?.latitud}
            longitud={detalle?.longitud}
          />

          {/* Habitaciones disponibles si es Hotel o cuenta con varias unidades */}
          {detalle?.unidades && detalle.unidades.length > 0 ? (
            <FichaHabitacionesDisponibles
              unidades={detalle.unidades}
              unidadSeleccionadaId={unidadSeleccionada?.id}
              alSeleccionarUnidad={(u) => {
                setUnidadSeleccionada(u);
                setEligiendo(true);
              }}
            />
          ) : null}

          {/* Mientras llega el detalle, cada bloque que falta se reserva con su esqueleto */}
          {cargando && !detalle ? (
            <EsqueletoDatosRapidos />
          ) : (
            <FichaDatosRapidos capacidadMax={detalle?.capacidadMax} horarioEntrada={detalle?.horarioEntrada} horarioSalida={detalle?.horarioSalida} />
          )}

          <FichaSobreYServicios descripcion={detalle?.descripcion ?? datos.descripcion} servicios={detalle?.servicios ?? []} />

          {cargando && !detalle ? <EsqueletoServicios /> : null}
          {error && !detalle ? (
            <View style={estilos.fallo}>
              <Text accessibilityRole="alert" style={estilos.error}>
                No se pudieron cargar los detalles: {error}
              </Text>
              <Boton variante="contorno" titulo={COMMON_TEXT.RETRY} onPress={recargar} />
            </View>
          ) : null}

          <FichaPoliticas politicas={detalle?.politicas} />

          {/* Sección verídica de Opiniones y Reseñas de Huéspedes */}
          <FichaOpinionesHuespedes
            calificacionPromedio={calificacion ?? null}
            totalResenas={totalResenas ?? 0}
            valoraciones={valoraciones}
          />
        </View>
      </ScrollView>

      <BarraReserva
        titulo={COMMON_TEXT.RESERVE}
        alPresionar={() => setEligiendo(true)}
        precio={typeof precio === 'number' ? formatearPrecio(precio) : undefined}
        unidadPrecio="/ noche"
        iconoDerecha={(c) => <ArrowRight color={c} size={18} />}
      />

      <OpcionesReservaSheet
        visible={eligiendo}
        titulo={titulo}
        alCerrar={() => setEligiendo(false)}
        alManual={() => {
          setEligiendo(false);
          alReservarManual();
        }}
        alAsistente={() => {
          setEligiendo(false);
          alAsistente();
        }}
      />
    </View>
  );
}
