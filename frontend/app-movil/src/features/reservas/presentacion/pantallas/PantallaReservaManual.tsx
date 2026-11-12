// ======================================================================
// ARCHIVO: reservas/presentacion/pantallas/PantallaReservaManual.tsx      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: La pantalla para reservar a mano: eliges habitación, fechas y huéspedes, ves la disponibilidad y el total, y reservas.
// PARA QUÉ SIRVE: Es la otra forma de reservar (la primera es hablar con el agente). Termina igual: una reserva pendiente de pago.
// SIN ÉL: Solo se podría reservar con el agente.
// NO VA AQUÍ: Reglas de reserva (casos) ni navegar: avisa con `alCreada` y `alQuedoEnCola`.
// ======================================================================
// Usa las MISMAS reglas que el agente (fechas válidas, máximo de noches, nada en el pasado): `casos.validarFechas`
// y `casos.crearReserva`. Sin internet la reserva se guarda en la cola y se envía sola.

import { CircleCheck, CircleX, Minus, Plus, Users, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { notificarNuevaReserva } from '../../../../core';
import { BarraReserva } from '../../../../shared/ui/BarraReserva';
import { Boton } from '../../../../shared/ui/Boton';
import { CampoFecha } from '../../../../shared/ui/CampoFecha';
import { hoyTexto, sumarDias } from '../../../../shared/ui/fechas';
import { formatearDinero, formatearPrecio } from '../../../../shared/ui/dinero';
import { pluralize } from '../../../../shared/ui/plural';
import { COMMON_TEXT } from '../../../../shared/ui/texts';
import { COLOR } from '../../../../shared/ui/tema';
import type { CasosReservas } from '../../domain/interfaces';
import type { AlojamientoReservable, UnidadReservable } from '../../domain/modelos';
import { estilos } from './PantallaReservaManual.styles';

interface Props {
  casos: CasosReservas;
  alojamiento: AlojamientoReservable;
  cliente: { id: string; nombre: string };
  /** La reserva se creó en el servidor: la pantalla siguiente es la de pagar. */
  alCreada: (reservaId: string) => void;
  /** No había internet y la reserva quedó en la cola: el usuario la verá en su lista de reservas. */
  alQuedoEnCola: () => void;
}

type Disponibilidad = 'SIN_CONSULTAR' | 'CONSULTANDO' | 'SI' | 'NO' | 'DESCONOCIDA';

export function PantallaReservaManual({ casos, alojamiento, cliente, alCreada, alQuedoEnCola }: Props) {
  const { unidades } = alojamiento;
  const [unidadId, setUnidadId] = useState<string | null>(unidades[0]?.id ?? null);
  const [huespedes, setHuespedes] = useState(1);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>('SIN_CONSULTAR');
  const [enviando, setEnviando] = useState(false);
  const [enCola, setEnCola] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unidad = unidades.find((u) => u.id === unidadId) ?? null;
  const hoy = hoyTexto();
  const manana = sumarDias(hoy, 1) ?? hoy;
  const noches = checkIn && checkOut ? casos.noches(checkIn, checkOut) : null;
  const errorFechas = checkIn && checkOut ? casos.validarFechas(checkIn, checkOut) : null;
  const fechasListas = !!checkIn && !!checkOut && noches !== null && errorFechas === null;
  const total = unidad && noches !== null ? unidad.precioNoche * noches : null;
  const idUnidadElegida = unidad?.id;

  // Cada vez que cambian la habitación o las fechas válidas, se pregunta si siguen libres.
  useEffect(() => {
    if (!idUnidadElegida || !checkIn || !checkOut || !fechasListas) {
      setDisponibilidad('SIN_CONSULTAR');
      return;
    }
    let vivo = true;
    setDisponibilidad('CONSULTANDO');
    casos.verificarDisponibilidad(idUnidadElegida, checkIn, checkOut).then(
      (r) => vivo && setDisponibilidad(r.disponible ? 'SI' : 'NO'),
      () => vivo && setDisponibilidad('DESCONOCIDA'),
    );
    return () => {
      vivo = false;
    };
  }, [casos, idUnidadElegida, checkIn, checkOut, fechasListas]);

  const elegirEntrada = (fecha: string) => {
    setCheckIn(fecha);
    // La salida siempre es al menos un día después de la entrada.
    if (!checkOut || checkOut <= fecha) setCheckOut(sumarDias(fecha, 1));
  };

  const elegirUnidad = (u: UnidadReservable) => {
    setUnidadId(u.id);
    setHuespedes((h) => Math.min(h, u.capacidad));
  };

  const puedeReservar =
    !!unidad && fechasListas && disponibilidad !== 'NO' && disponibilidad !== 'CONSULTANDO' && !enviando && !enCola;

  const reservar = async () => {
    if (!puedeReservar || !unidad || !checkIn || !checkOut) return;
    setEnviando(true);
    setError(null);
    try {
      const r = await casos.crearReserva({
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        anfitrionId: alojamiento.anfitrionId,
        alojamientoId: alojamiento.alojamientoId,
        alojamientoTitulo: alojamiento.titulo,
        unidadId: unidad.id,
        unidadNombre: unidad.nombre,
        checkIn,
        checkOut,
        huespedes,
        precioNoche: unidad.precioNoche,
      });
      if (r.tipo === 'CREADA') {
        alCreada(r.reserva.id);
        return;
      }
      setEnCola(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la reserva.');
    } finally {
      setEnviando(false);
    }
  };

  if (unidades.length === 0) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.tituloSeccion}>Sin habitaciones disponibles</Text>
        <Text style={estilos.suave}>Este alojamiento no tiene habitaciones para reservar por ahora.</Text>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 2 }}>
          <Text style={estilos.suave}>Reserva manual</Text>
          <Text style={estilos.titulo}>{alojamiento.titulo}</Text>
        </View>

        <View style={estilos.grupo}>
          <Text style={estilos.tituloSeccion}>Habitación</Text>
          {unidades.map((u) => {
            const elegida = u.id === unidadId;
            return (
              <Pressable
                key={u.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: elegida }}
                accessibilityLabel={`${u.nombre}, hasta ${u.capacidad} personas, Bs ${formatearPrecio(u.precioNoche)} por noche`}
                onPress={() => elegirUnidad(u)}
                style={[estilos.unidad, elegida && estilos.unidadElegida]}
              >
                <View style={[estilos.radio, elegida && estilos.radioElegido]}>
                  {elegida ? <View style={estilos.radioPunto} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.unidadNombre}>{u.nombre}</Text>
                  <Text style={estilos.suave}>Hasta {u.capacidad} {pluralize(u.capacidad, 'persona', 'personas')}</Text>
                </View>
                <Text style={estilos.unidadPrecio}>
                  Bs {formatearPrecio(u.precioNoche)} <Text style={estilos.suave}>/ noche</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={estilos.grupo}>
          <Text style={estilos.tituloSeccion}>Fechas</Text>
          <View style={estilos.filaFechas}>
            <CampoFecha etiqueta="Entrada" valor={checkIn} minimo={hoy} alCambiar={elegirEntrada} deshabilitado={enviando || enCola} />
            <CampoFecha
              etiqueta="Salida"
              valor={checkOut}
              minimo={checkIn ? (sumarDias(checkIn, 1) ?? manana) : manana}
              alCambiar={setCheckOut}
              deshabilitado={enviando || enCola}
            />
          </View>
          {errorFechas ? (
            <Text accessibilityRole="alert" style={estilos.error}>
              {errorFechas}
            </Text>
          ) : null}
        </View>

        <View style={estilos.grupo}>
          <Text style={estilos.tituloSeccion}>Huéspedes</Text>
          <View style={estilos.contador}>
            <View style={estilos.contadorTexto}>
              <Users color={COLOR.primario} size={20} />
              <Text style={estilos.contadorValor}>
                {huespedes} {pluralize(huespedes, 'persona', 'personas')}
              </Text>
            </View>
            <View style={estilos.botonesContador}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Una persona menos"
                disabled={huespedes <= 1 || enviando || enCola}
                onPress={() => setHuespedes((h) => Math.max(1, h - 1))}
                style={[estilos.paso, (huespedes <= 1 || enviando || enCola) && { opacity: 0.4 }]}
              >
                <Minus color={COLOR.texto} size={20} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Una persona más"
                disabled={!unidad || huespedes >= unidad.capacidad || enviando || enCola}
                onPress={() => setHuespedes((h) => Math.min(unidad?.capacidad ?? h, h + 1))}
                style={[estilos.paso, (!unidad || huespedes >= unidad.capacidad || enviando || enCola) && { opacity: 0.4 }]}
              >
                <Plus color={COLOR.texto} size={20} />
              </Pressable>
            </View>
          </View>
          {unidad ? <Text style={estilos.suave}>Esta habitación admite hasta {unidad.capacidad}.</Text> : null}
        </View>

        {unidad && noches !== null && total !== null && fechasListas ? (
          <View style={estilos.resumen}>
            <View style={estilos.filaResumen}>
              <Text style={estilos.suave}>
                Bs {formatearPrecio(unidad.precioNoche)} × {noches} {pluralize(noches, 'noche', 'noches')}
              </Text>
              <Text style={estilos.valor}>{formatearDinero(total, 'Bs')}</Text>
            </View>
            <Estado disponibilidad={disponibilidad} />
          </View>
        ) : null}

        {error ? (
          <Text accessibilityRole="alert" style={estilos.error}>
            {error}
          </Text>
        ) : null}

        {enCola ? (
          <View style={estilos.cola}>
            <WifiOff color={COLOR.aviso} size={22} />
            <Text style={estilos.colaTexto}>
              No hay internet, pero guardamos tu reserva y se enviará sola cuando vuelva la conexión. Después podrás pagarla desde Perfil, en "Mis reservas".
            </Text>
            <Boton titulo="Ver mis reservas" onPress={alQuedoEnCola} />
          </View>
        ) : null}
      </ScrollView>

      {!enCola && (
        <BarraReserva
          titulo={COMMON_TEXT.RESERVE}
          alPresionar={() => void reservar()}
          deshabilitado={!puedeReservar}
          cargando={enviando}
          precio={total !== null && fechasListas ? total.toFixed(2) : undefined}
          unidadPrecio={noches !== null && fechasListas ? `por ${noches} ${pluralize(noches, 'noche', 'noches')}` : undefined}
          nota="Pagas en el siguiente paso"
        />
      )}
    </View>
  );
}

function Estado({ disponibilidad }: { disponibilidad: Disponibilidad }) {
  switch (disponibilidad) {
    case 'CONSULTANDO':
      return (
        <View style={estilos.estado}>
          <ActivityIndicator size="small" color={COLOR.primario} />
          <Text style={estilos.suave}>Verificando disponibilidad…</Text>
        </View>
      );
    case 'SI':
      return (
        <View style={estilos.estado}>
          <CircleCheck color={COLOR.exito} size={18} />
          <Text style={[estilos.estadoTexto, { color: COLOR.exitoOscuro }]}>Disponible en esas fechas</Text>
        </View>
      );
    case 'NO':
      return (
        <View style={estilos.estado}>
          <CircleX color={COLOR.error} size={18} />
          <Text accessibilityRole="alert" style={[estilos.estadoTexto, { color: COLOR.errorOscuro }]}>
            No está disponible en esas fechas. Prueba otras fechas u otra habitación.
          </Text>
        </View>
      );
    case 'DESCONOCIDA':
      return (
        <View style={estilos.estado}>
          <WifiOff color={COLOR.aviso} size={18} />
          <Text style={[estilos.estadoTexto, { color: COLOR.avisoOscuro }]}>No se pudo verificar: se confirmará al enviar la reserva.</Text>
        </View>
      );
    default:
      return null;
  }
}
