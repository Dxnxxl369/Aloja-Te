// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaHabitacionesDisponibles.tsx
// QUÉ ES: Lista interactiva de habitaciones disponibles cuando el alojamiento es un hotel.
// ======================================================================

import { BedDouble, Check, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';
import type { UnidadCatalogo } from '../../../domain/modelos';
import { BloqueFicha } from './BloqueFicha';

interface Props {
  unidades: UnidadCatalogo[];
  unidadSeleccionadaId?: string | null;
  alSeleccionarUnidad: (unidad: UnidadCatalogo) => void;
}

export function FichaHabitacionesDisponibles({
  unidades,
  unidadSeleccionadaId,
  alSeleccionarUnidad,
}: Props) {
  if (!unidades || unidades.length === 0) return null;

  return (
    <BloqueFicha titulo="Habitaciones Disponibles" derecha={`${unidades.length} tipos`}>
      <View style={estilos.lista}>
        {unidades.map((u) => {
          const seleccionada = unidadSeleccionadaId === u.id;
          return (
            <Pressable
              key={u.id}
              onPress={() => alSeleccionarUnidad(u)}
              style={[estilos.tarjeta, seleccionada && estilos.tarjetaSeleccionada]}
              accessibilityRole="button"
              accessibilityLabel={`Habitación ${u.nombre}, precio Bs. ${u.precioNoche} por noche`}
            >
              <View style={estilos.iconoCaja}>
                <BedDouble color={seleccionada ? COLOR.primario : COLOR.textoSuave} size={22} />
              </View>

              <View style={estilos.info}>
                <Text style={[estilos.nombre, seleccionada && estilos.nombreSeleccionado]}>
                  {u.nombre}
                </Text>
                <View style={estilos.filaCapacidad}>
                  <Users color={COLOR.textoSuave} size={13} />
                  <Text style={estilos.capacidad}>
                    Hasta {u.capacidad} {u.capacidad === 1 ? 'huésped' : 'huéspedes'}
                  </Text>
                </View>
              </View>

              <View style={estilos.precioCaja}>
                <Text style={estilos.precio}>Bs. {u.precioNoche}</Text>
                <Text style={estilos.noche}>/ noche</Text>
                {seleccionada && (
                  <View style={estilos.checkIcono}>
                    <Check color={COLOR.primario} size={16} strokeWidth={2.5} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </BloqueFicha>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: ESPACIO.s,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    backgroundColor: COLOR.campo,
    padding: ESPACIO.m,
    borderRadius: RADIO.control,
    borderWidth: 1.5,
    borderColor: COLOR.borde,
  },
  tarjetaSeleccionada: {
    borderColor: COLOR.primario,
    backgroundColor: COLOR.primarioSuave,
  },
  iconoCaja: {
    padding: 6,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    ...FUENTE.semi,
    fontSize: TAMANO.cuerpo,
    color: COLOR.texto,
  },
  nombreSeleccionado: {
    color: COLOR.primario,
  },
  filaCapacidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacidad: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  precioCaja: {
    alignItems: 'flex-end',
  },
  precio: {
    ...FUENTE.tituloFuerte,
    fontSize: 16,
    color: COLOR.texto,
  },
  noche: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  checkIcono: {
    marginTop: 2,
  },
});
