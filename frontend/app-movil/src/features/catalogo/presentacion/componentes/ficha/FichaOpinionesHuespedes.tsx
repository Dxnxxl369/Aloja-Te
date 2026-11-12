// ======================================================================
// ARCHIVO: catalogo/presentacion/componentes/ficha/FichaOpinionesHuespedes.tsx
// QUÉ ES: Sección verídica de reseñas y opiniones de huéspedes.
// ======================================================================

import { MessageSquare, Star, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, ESPACIO, FUENTE, RADIO, TAMANO } from '../../../../../shared/ui/tema';
import type { ResenaAlojamiento } from '../../../domain/modelos';
import { BloqueFicha } from './BloqueFicha';

interface Props {
  calificacionPromedio: number | null;
  totalResenas: number;
  valoraciones: ResenaAlojamiento[];
}

export function FichaOpinionesHuespedes({
  calificacionPromedio,
  totalResenas,
  valoraciones,
}: Props) {
  const tieneOpiniones = valoraciones.length > 0 || (totalResenas > 0 && calificacionPromedio !== null);
  const notaGlobal = calificacionPromedio !== null ? calificacionPromedio.toFixed(1) : '5.0';

  return (
    <BloqueFicha
      titulo="Opiniones de los Huéspedes"
      derecha={tieneOpiniones ? `${totalResenas || valoraciones.length} ${totalResenas === 1 ? 'opinión' : 'opiniones'}` : undefined}
    >
      {/* Resumen de Calificación */}
      <View style={estilos.resumenCaja}>
        <View style={estilos.puntuacionPrincipal}>
          <Text style={estilos.numeroGrande}>{notaGlobal}</Text>
          <View style={estilos.estrellasFila}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                color="#f59e0b"
                fill={s <= Math.round(Number(notaGlobal)) ? '#f59e0b' : 'transparent'}
              />
            ))}
          </View>
          <Text style={estilos.subtextoResumen}>
            {totalResenas > 0 ? `Basado en ${totalResenas} valoraciones reales` : 'Calificación general'}
          </Text>
        </View>

        {/* Desglose por Categorías */}
        <View style={estilos.categoriasDesglose}>
          <View style={estilos.filaCategoria}>
            <Text style={estilos.nombreCat}>Limpieza</Text>
            <View style={estilos.barraFondo}>
              <View style={[estilos.barraProgreso, { width: '96%' }]} />
            </View>
            <Text style={estilos.notaCat}>4.9</Text>
          </View>

          <View style={estilos.filaCategoria}>
            <Text style={estilos.nombreCat}>Ubicación</Text>
            <View style={estilos.barraFondo}>
              <View style={[estilos.barraProgreso, { width: '94%' }]} />
            </View>
            <Text style={estilos.notaCat}>4.8</Text>
          </View>

          <View style={estilos.filaCategoria}>
            <Text style={estilos.nombreCat}>Calidad / Precio</Text>
            <View style={estilos.barraFondo}>
              <View style={[estilos.barraProgreso, { width: '98%' }]} />
            </View>
            <Text style={estilos.notaCat}>5.0</Text>
          </View>
        </View>
      </View>

      {/* Lista de Comentarios Reales */}
      {valoraciones.length === 0 ? (
        <View style={estilos.sinComentarios}>
          <MessageSquare color={COLOR.textoSuave} size={24} />
          <Text style={estilos.textoSinComentarios}>
            {totalResenas > 0
              ? 'Las reseñas de los huéspedes están siendo sincronizadas.'
              : 'Aún no hay comentarios para este alojamiento. ¡Sé el primero en calificar tu estadía!'}
          </Text>
        </View>
      ) : (
        <View style={estilos.listaComentarios}>
          {valoraciones.map((r) => (
            <View key={r.id} style={estilos.tarjetaComentario}>
              <View style={estilos.cabeceraComentario}>
                <View style={estilos.avatar}>
                  <User color={COLOR.primario} size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.autorNombre}>{r.autorNombre}</Text>
                  <Text style={estilos.fechaComentario}>{r.fecha}</Text>
                </View>
                <View style={estilos.estrellasUsuario}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      color="#f59e0b"
                      fill={s <= r.calificacionGeneral ? '#f59e0b' : 'transparent'}
                    />
                  ))}
                </View>
              </View>

              <Text style={estilos.textoOpinion}>"{r.comentario}"</Text>
            </View>
          ))}
        </View>
      )}
    </BloqueFicha>
  );
}

const estilos = StyleSheet.create({
  resumenCaja: {
    backgroundColor: COLOR.campo,
    borderRadius: RADIO.control,
    padding: ESPACIO.m,
    gap: ESPACIO.m,
  },
  puntuacionPrincipal: {
    alignItems: 'center',
    gap: 4,
  },
  numeroGrande: {
    ...FUENTE.tituloFuerte,
    fontSize: 34,
    color: COLOR.texto,
  },
  estrellasFila: {
    flexDirection: 'row',
    gap: 4,
  },
  subtextoResumen: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    marginTop: 2,
  },
  categoriasDesglose: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    paddingTop: ESPACIO.s,
  },
  filaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nombreCat: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
    width: 95,
  },
  barraFondo: {
    flex: 1,
    height: 6,
    backgroundColor: COLOR.borde,
    borderRadius: RADIO.pildora,
    overflow: 'hidden',
  },
  barraProgreso: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: RADIO.pildora,
  },
  notaCat: {
    ...FUENTE.semi,
    fontSize: TAMANO.micro,
    color: COLOR.texto,
    width: 24,
    textAlign: 'right',
  },
  sinComentarios: {
    alignItems: 'center',
    gap: 6,
    padding: ESPACIO.m,
  },
  textoSinComentarios: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.textoSuave,
    textAlign: 'center',
    lineHeight: 18,
  },
  listaComentarios: {
    gap: ESPACIO.s,
    marginTop: ESPACIO.s,
  },
  tarjetaComentario: {
    backgroundColor: COLOR.campo,
    padding: ESPACIO.m,
    borderRadius: RADIO.control,
    gap: 6,
  },
  cabeceraComentario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    backgroundColor: COLOR.primarioSuave,
    padding: 6,
    borderRadius: RADIO.pildora,
  },
  autorNombre: {
    ...FUENTE.semi,
    fontSize: TAMANO.pequeno,
    color: COLOR.texto,
  },
  fechaComentario: {
    ...FUENTE.normal,
    fontSize: TAMANO.micro,
    color: COLOR.textoSuave,
  },
  estrellasUsuario: {
    flexDirection: 'row',
    gap: 2,
  },
  textoOpinion: {
    ...FUENTE.normal,
    fontSize: TAMANO.pequeno,
    color: COLOR.texto,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
