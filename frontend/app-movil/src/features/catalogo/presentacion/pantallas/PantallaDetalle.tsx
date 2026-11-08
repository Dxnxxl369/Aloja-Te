// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaDetalle.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La ficha de un alojamiento: fotos, y debajo los bloques Encabezado, Ubicación, Datos rápidos, Sobre este alojamiento y Políticas, más la barra de reservar.
// PARA QUÉ SIRVE: Es donde el usuario decide si reserva (a mano o con el agente).
// SIN ÉL: Las tarjetas del explorador no llevarían a ningún detalle.
// NO VA AQUÍ: Cargar datos (useDetalle), dibujar cada bloque (están en componentes/ficha) ni navegar: avisa con `alReservarManual` y `alAsistente`.
// ======================================================================
// Esta pantalla solo ordena los bloques. Pinta de inmediato lo que ya trae la tarjeta (`datos`) y completa cuando llega
// el detalle. Cada bloque se dibuja solo si tiene datos reales de la base (sin camas, baños ni anfitrión: esos datos no existen).

import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraReserva } from '../../../../shared/ui/BarraReserva';
import { Boton } from '../../../../shared/ui/Boton';
import { formatearPrecio } from '../../../../shared/ui/TarjetaAlojamiento';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import { COLOR, ESPACIO, FUENTE, TAMANO } from '../../../../shared/ui/tema';
import type { CasosCatalogo } from '../../domain/interfaces';
import { CarruselFotos } from '../componentes/CarruselFotos';
import { FichaDatosRapidos } from '../componentes/ficha/FichaDatosRapidos';
import { FichaEncabezado } from '../componentes/ficha/FichaEncabezado';
import { FichaPoliticas } from '../componentes/ficha/FichaPoliticas';
import { FichaSobreYServicios } from '../componentes/ficha/FichaSobreYServicios';
import { FichaUbicacion } from '../componentes/ficha/FichaUbicacion';
import { unir } from '../componentes/ficha/texto';
import { OpcionesReservaSheet } from '../componentes/OpcionesReservaSheet';
import { useDetalle } from '../useDetalle';

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
  const { detalle, cargando, error, recargar } = useDetalle(casos, datos.id);
  const [eligiendo, setEligiendo] = useState(false);

  // Lo que hay primero (tarjeta) se reemplaza por lo completo (detalle) cuando llega.
  const titulo = detalle?.titulo ?? datos.titulo;
  const calificacion = detalle ? detalle.calificacion : datos.calificacion;
  const totalResenas = detalle ? detalle.totalResenas : datos.totalResenas;
  const precio = detalle ? detalle.precioDesde : (datos.precioNoche ?? null);
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

          <FichaDatosRapidos capacidadMax={detalle?.capacidadMax} horarioEntrada={detalle?.horarioEntrada} horarioSalida={detalle?.horarioSalida} />

          <FichaSobreYServicios descripcion={detalle?.descripcion ?? datos.descripcion} servicios={detalle?.servicios ?? []} />

          {cargando && !detalle ? (
            <View style={estilos.cargando}>
              <ActivityIndicator color={COLOR.primario} />
              <Text style={estilos.suave}>Cargando detalles…</Text>
            </View>
          ) : null}
          {error && !detalle ? (
            <View style={estilos.fallo}>
              <Text accessibilityRole="alert" style={estilos.error}>
                No se pudieron cargar los detalles: {error}
              </Text>
              <Boton variante="contorno" titulo="Reintentar" onPress={recargar} />
            </View>
          ) : null}

          <FichaPoliticas politicas={detalle?.politicas} />
        </View>
      </ScrollView>

      <BarraReserva
        titulo="Reservar"
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

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { paddingBottom: ESPACIO.xl },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.l },
  suave: { ...FUENTE.normal, fontSize: TAMANO.secundario, color: COLOR.textoSuave, flexShrink: 1 },

  cargando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.m },
  fallo: { gap: ESPACIO.m },
  error: { ...FUENTE.medio, fontSize: TAMANO.secundario, color: COLOR.errorOscuro, textAlign: 'center' },
});
