// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ServiciosGrid.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La cuadrícula "Lo que ofrece este lugar": cada servicio con su icono, en dos columnas.
// PARA QUÉ SIRVE: Ver de un vistazo si hay wifi, piscina, estacionamiento, etc.
// SIN ÉL: Los servicios serían una lista de texto.
// NO VA AQUÍ: Cargar los servicios: recibe los nombres que publica MS-01.
// ======================================================================
// El icono se escoge por el nombre; si no se reconoce, es un check. Se muestran 8 y el resto con "Ver todos".

import { Car, Check, Coffee, Dumbbell, Flame, PawPrint, ShowerHead, Snowflake, Tv, Utensils, Waves, Wifi } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO } from '../../../../shared/ui/tema';

const MAX_INICIAL = 8;

function iconoDe(nombre: string): LucideIcon {
  const n = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  if (/wifi|internet|fibra/.test(n)) return Wifi;
  if (/piscina|pileta|alberca/.test(n)) return Waves;
  if (/desayuno|cafe/.test(n)) return Coffee;
  if (/aire|acondicionado|climatiz/.test(n)) return Snowflake;
  if (/estacionamiento|parqueo|parking|garaje|cochera/.test(n)) return Car;
  if (/tv|television|cable/.test(n)) return Tv;
  if (/cocina|restaurante|comedor/.test(n)) return Utensils;
  if (/calefaccion|chimenea|calefactor/.test(n)) return Flame;
  if (/gimnasio|gym/.test(n)) return Dumbbell;
  if (/mascota|pet/.test(n)) return PawPrint;
  if (/ducha|bano|jacuzzi|spa/.test(n)) return ShowerHead;
  return Check;
}

export function ServiciosGrid({ servicios }: { servicios: string[] }) {
  const [verTodos, setVerTodos] = useState(false);
  if (servicios.length === 0) return null;
  const visibles = verTodos ? servicios : servicios.slice(0, MAX_INICIAL);
  const sobran = servicios.length - MAX_INICIAL;

  return (
    <View style={{ gap: ESPACIO.m }}>
      <View style={estilos.grilla}>
        {visibles.map((nombre) => {
          const Icono = iconoDe(nombre);
          return (
            <View key={nombre} style={estilos.item}>
              <Icono color={COLOR.primario} size={20} />
              <Text style={estilos.texto} numberOfLines={2}>
                {nombre}
              </Text>
            </View>
          );
        })}
      </View>
      {sobran > 0 && (
        <Pressable accessibilityRole="button" onPress={() => setVerTodos((v) => !v)} style={estilos.enlace}>
          <Text style={estilos.enlaceTexto}>{verTodos ? 'Ver menos' : `Ver los ${servicios.length} servicios`}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
  item: {
    width: '48.5%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIO.m,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: ESPACIO.s,
    borderRadius: RADIO.tarjeta,
    backgroundColor: COLOR.tarjeta,
    borderWidth: 1,
    borderColor: COLOR.borde,
  },
  texto: { flex: 1, fontFamily: FUENTE.medio, fontSize: 13, color: COLOR.texto },
  enlace: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  enlaceTexto: { fontFamily: FUENTE.semi, fontSize: 14, color: COLOR.primario },
});
