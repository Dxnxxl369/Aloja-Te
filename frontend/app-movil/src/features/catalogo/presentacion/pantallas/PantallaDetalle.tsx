// ======================================================================
// ARCHIVO: catalogo/presentacion/pantallas/PantallaDetalle.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La ficha de un alojamiento: fotos, nombre, lugar, capacidad, descripción, servicios, políticas y la barra de reservar.
// PARA QUÉ SIRVE: Es donde el usuario decide si reserva (a mano o con el asistente).
// SIN ÉL: Las tarjetas del explorador no llevarían a ningún detalle.
// NO VA AQUÍ: Cargar datos (useDetalle) ni navegar: avisa con `alReservar` y `alAsistente`.
// ======================================================================
// Diseño: mockup "Detalle de alojamiento". Pinta de inmediato lo que ya trae la tarjeta (`datos`) y completa
// cuando llega el detalle. Solo se dibuja lo que MS-01 entrega: sin camas, baños ni anfitrión (esos datos no existen).

import { ArrowRight, Clock, MapPin, ShieldCheck, Users } from 'lucide-react-native';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraReserva } from '../../../../shared/ui/BarraReserva';
import { Boton } from '../../../../shared/ui/Boton';
import { Calificacion } from '../../../../shared/ui/Calificacion';
import { formatearPrecio } from '../../../../shared/ui/TarjetaAlojamiento';
import type { DatosTarjetaAlojamiento } from '../../../../shared/ui/TarjetaAlojamiento';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';
import type { CasosCatalogo } from '../../domain/interfaces';
import type { DetalleAlojamiento } from '../../domain/modelos';
import { CarruselFotos } from '../componentes/CarruselFotos';
import { ServiciosGrid } from '../componentes/ServiciosGrid';
import { TarjetaAsistenteIa } from '../componentes/TarjetaAsistenteIa';
import { useDetalle } from '../useDetalle';

interface Props {
  casos: CasosCatalogo;
  /** Lo que ya sabe la tarjeta: se muestra mientras llega el detalle. */
  datos: DatosTarjetaAlojamiento;
  /** true si el modelo de IA local está cargado. */
  iaLista: boolean;
  alReservar: () => void;
  alAsistente: () => void;
}

/** Quita lo repetido ("La Paz, La Paz") y lo vacío, y une con el separador. */
function unir(partes: (string | undefined)[], separador: string): string {
  const limpias = partes.filter((p): p is string => !!p && p.trim().length > 0);
  return limpias.filter((p, i) => limpias.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i).join(separador);
}

/** El destino para la app de mapas: coordenadas si las hay; si no, la dirección. null si no hay nada. */
function destinoDelMapa(d: DetalleAlojamiento): string | null {
  if (d.latitud !== undefined && d.longitud !== undefined) return `${d.latitud},${d.longitud}`;
  const direccion = unir([d.direccion, d.ciudad, d.departamento], ', ');
  return d.direccion ? direccion : null;
}

export function PantallaDetalle({ casos, datos, iaLista, alReservar, alAsistente }: Props) {
  const { detalle, cargando, error, recargar } = useDetalle(casos, datos.id);

  // Lo que hay primero (tarjeta) se reemplaza por lo completo (detalle) cuando llega.
  const titulo = detalle?.titulo ?? datos.titulo;
  const tipo = detalle?.tipo ?? datos.tipo;
  const calificacion = detalle ? detalle.calificacion : datos.calificacion;
  const totalResenas = detalle ? detalle.totalResenas : datos.totalResenas;
  const precio = detalle ? detalle.precioDesde : (datos.precioNoche ?? null);
  const fotos = detalle && detalle.fotos.length > 0 ? detalle.fotos : datos.fotoUrl ? [datos.fotoUrl] : [];
  const descripcion = detalle?.descripcion ?? datos.descripcion;
  const ciudad = detalle?.ciudad ?? datos.ciudad;
  const departamento = detalle?.departamento ?? datos.departamento;
  const lugarCorto = unir([ciudad, departamento], ' · ');
  const direccionCompleta = detalle ? unir([detalle.direccion, ciudad, departamento], ', ') : unir([ciudad, departamento], ', ');
  const destinoMapa = detalle ? destinoDelMapa(detalle) : null;

  const abrirMapa = () => {
    if (!destinoMapa) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinoMapa)}`).catch(() =>
      Alert.alert('No se pudo abrir el mapa', 'Revisa que tengas una aplicación de mapas o un navegador.'),
    );
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.pagina}>
        <CarruselFotos fotos={fotos} titulo={titulo} lugar={lugarCorto || undefined} verificado={datos.verificado} />

        <View style={estilos.cuerpo}>
          <View style={estilos.filaTipo}>
            {tipo ? <Text style={estilos.tipo}>{tipo.toUpperCase()}</Text> : <View />}
            <Calificacion nota={calificacion} totalResenas={totalResenas} variante="pildora" />
          </View>
          <Text style={estilos.titulo} accessibilityRole="header">
            {titulo}
          </Text>

          {direccionCompleta ? (
            <View style={estilos.filaDireccion}>
              <MapPin color={COLOR.primario} size={18} />
              <Text style={estilos.direccion} numberOfLines={2}>
                {direccionCompleta}
              </Text>
              {destinoMapa ? (
                <Text accessibilityRole="link" accessibilityLabel="Ver mapa" onPress={abrirMapa} style={estilos.enlace}>
                  Ver mapa
                </Text>
              ) : null}
            </View>
          ) : null}

          {detalle?.capacidadMax ? (
            <View style={estilos.dato}>
              <View style={estilos.datoIcono}>
                <Users color={COLOR.primario} size={20} />
              </View>
              <View>
                <Text style={estilos.datoEtiqueta}>Capacidad</Text>
                <Text style={estilos.datoValor}>
                  hasta {detalle.capacidadMax} {detalle.capacidadMax === 1 ? 'huésped' : 'huéspedes'}
                </Text>
              </View>
            </View>
          ) : null}

          {descripcion ? (
            <View style={estilos.tarjeta}>
              <Text style={estilos.seccionTitulo}>Sobre este alojamiento</Text>
              <Text style={estilos.descripcion}>{descripcion}</Text>
            </View>
          ) : null}

          <TarjetaAsistenteIa iaLista={iaLista} alHablar={alAsistente} />

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

          {detalle && detalle.servicios.length > 0 ? (
            <View style={{ gap: ESPACIO.m }}>
              <View style={estilos.filaServicios}>
                <Text style={estilos.seccionTitulo}>Lo que ofrece este lugar</Text>
                <Text style={estilos.suave}>
                  {detalle.servicios.length} {detalle.servicios.length === 1 ? 'servicio' : 'servicios'}
                </Text>
              </View>
              <ServiciosGrid servicios={detalle.servicios} />
            </View>
          ) : null}

          <View style={estilos.tarjeta}>
            <View style={estilos.filaProtegida}>
              <ShieldCheck color={COLOR.primario} size={22} />
              <Text style={estilos.seccionTitulo}>Reserva protegida Aloja-Te</Text>
            </View>
            <Text style={estilos.descripcion}>
              Tus fechas quedan bloqueadas unos minutos mientras pagas con QR. Si no pagas a tiempo, se liberan para otros huéspedes.
            </Text>
            {detalle?.horarioEntrada || detalle?.horarioSalida ? (
              <View style={estilos.horarios}>
                <Clock color={COLOR.textoSuave} size={16} />
                <Text style={estilos.suave}>
                  {unir(
                    [
                      detalle.horarioEntrada ? `Check-in ${detalle.horarioEntrada}` : undefined,
                      detalle.horarioSalida ? `Check-out ${detalle.horarioSalida}` : undefined,
                    ],
                    ' · ',
                  )}
                </Text>
              </View>
            ) : null}
            {detalle?.politicas ? <Text style={estilos.descripcion}>{detalle.politicas}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <BarraReserva
        titulo="Reservar"
        alPresionar={alReservar}
        alAsistente={alAsistente}
        precio={typeof precio === 'number' ? formatearPrecio(precio) : undefined}
        unidadPrecio="/ noche"
        nota="Inventario en tiempo real"
        iconoDerecha={(c) => <ArrowRight color={c} size={18} />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLOR.fondo },
  pagina: { paddingBottom: ESPACIO.xl },
  cuerpo: { padding: ESPACIO.l, gap: ESPACIO.l },
  filaTipo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  tipo: { fontFamily: FUENTE.semi, fontSize: 11, letterSpacing: 0.6, color: COLOR.primario, flexShrink: 1 },
  titulo: { fontFamily: FUENTE.tituloFuerte, fontSize: 28, lineHeight: 36, color: COLOR.texto },
  filaDireccion: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  direccion: { flex: 1, fontFamily: FUENTE.normal, fontSize: 14, color: COLOR.textoSuave },
  enlace: { fontFamily: FUENTE.semi, fontSize: 14, color: COLOR.primario, paddingVertical: ESPACIO.s },

  dato: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m, padding: ESPACIO.m, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  datoIcono: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLOR.primarioSuave, alignItems: 'center', justifyContent: 'center' },
  datoEtiqueta: { fontFamily: FUENTE.normal, fontSize: 12, color: COLOR.textoSuave },
  datoValor: { fontFamily: FUENTE.semi, fontSize: 16, color: COLOR.texto },

  tarjeta: { gap: ESPACIO.m, padding: ESPACIO.l, borderRadius: RADIO.tarjeta, backgroundColor: COLOR.tarjeta, borderWidth: 1, borderColor: COLOR.borde },
  seccionTitulo: { fontFamily: FUENTE.titulo, fontSize: 20, color: COLOR.texto, flexShrink: 1 },
  descripcion: { fontFamily: FUENTE.normal, fontSize: 15, lineHeight: 23, color: COLOR.texto },
  suave: { fontFamily: FUENTE.normal, fontSize: 13, color: COLOR.textoSuave, flexShrink: 1 },

  cargando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACIO.m, paddingVertical: ESPACIO.m },
  fallo: { gap: ESPACIO.m },
  error: { fontFamily: FUENTE.medio, fontSize: 14, color: COLOR.error, textAlign: 'center' },

  filaServicios: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACIO.m },
  filaProtegida: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
  horarios: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.s },
});
