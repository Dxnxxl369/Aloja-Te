// ======================================================================
// ARCHIVO: agente/domain/casos.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: El cerebro del agente: ejecuta el PLAN paso a paso (entender -> completar -> buscar -> elegir -> verificar -> confirmar -> reservar) y entrega el pago al usuario.
// PARA QUÉ SIRVE: La IA solo ENTIENDE el mensaje. Quién decide y ejecuta es este plan, y la reserva solo se crea tras un "sí" explícito del usuario.
// SIN ÉL: No habría agente, solo un chat.
// NO VA AQUÍ: HTTP, SQLite, React ni el modelo de IA: todo entra por interfaces.
// ======================================================================
// Cada función recibe el estado y devuelve el estado nuevo (no guarda estado propio).
// Por qué el texto de las respuestas es fijo y no lo escribe la IA: un modelo pequeño
// en el celular se equivoca; el plan es determinista, se puede probar y no inventa datos.
// El PAGO queda fuera del agente a propósito: el agente termina entregando `reservaId`.

import { MAX_OPCIONES } from '../constantes';
import type { CasosAgente, CatalogoAlojamientos, MotorLenguaje, Reservador } from './interfaces';
import type { Criterios, EstadoAgente, Mensaje, Opcion, PasoId, EstadoPaso } from './modelos';
import {
  descripcionOpcion,
  faltantes,
  haySoloDatosNuevos,
  interpretarConfirmacion,
  interpretarEleccion,
  marcar,
  mezclar,
  planInicial,
  preguntaPara,
  recomendar,
  reiniciarDesde,
} from './plan';

export function crearCasosAgente(deps: {
  motor: MotorLenguaje;
  catalogo: CatalogoAlojamientos;
  reservador: Reservador;
}): CasosAgente {
  const { motor, catalogo, reservador } = deps;

  // --- ayudas pequeñas -------------------------------------------------------
  const decir = (e: EstadoAgente, rol: Mensaje['rol'], texto: string): EstadoAgente => ({
    ...e,
    mensajes: [...e.mensajes, { id: e.mensajes.length + 1, rol, texto }],
  });
  const paso = (e: EstadoAgente, id: PasoId, estado: EstadoPaso, nota?: string): EstadoAgente => ({
    ...e,
    plan: marcar(e.plan, id, estado, nota),
  });
  const mensajeDeError = (err: unknown) => (err instanceof Error ? err.message : 'Ocurrió un error inesperado.');

  function inicial(): EstadoAgente {
    return decir(
      {
        fase: 'CONVERSANDO',
        criterios: {},
        opciones: [],
        eleccion: null,
        plan: planInicial(),
        mensajes: [],
        reservaId: null,
        claveCola: null,
      },
      'agente',
      '¡Hola! Cuéntame qué alojamiento buscas: ciudad, fechas y cuántas personas.',
    );
  }

  // --- pasos del plan --------------------------------------------------------

  /** COMPLETAR_DATOS: si falta algo, lo pregunta; si no, sigue a buscar. */
  async function completarOBuscar(e: EstadoAgente): Promise<EstadoAgente> {
    const falta = faltantes(e.criterios)[0];
    if (falta) {
      return decir(paso({ ...e, fase: 'CONVERSANDO' }, 'COMPLETAR_DATOS', 'EN_CURSO'), 'agente', preguntaPara(falta));
    }
    return buscar(paso(e, 'COMPLETAR_DATOS', 'HECHO'));
  }

  /** BUSCAR -> ELEGIR */
  async function buscar(e: EstadoAgente): Promise<EstadoAgente> {
    let s = paso(e, 'BUSCAR', 'EN_CURSO');
    let encontradas: Opcion[];
    try {
      encontradas = await catalogo.buscar(s.criterios);
    } catch (err) {
      s = paso({ ...s, fase: 'CONVERSANDO' }, 'BUSCAR', 'FALLIDO', mensajeDeError(err));
      return decir(s, 'agente', 'No pude consultar los alojamientos ahora. Inténtalo de nuevo en un momento.');
    }
    const opciones = [...encontradas].sort((a, b) => a.precioNoche - b.precioNoche).slice(0, MAX_OPCIONES);
    if (opciones.length === 0) {
      s = paso({ ...s, fase: 'CONVERSANDO', opciones: [] }, 'BUSCAR', 'FALLIDO', 'Sin resultados');
      return decir(s, 'agente', 'No encontré alojamientos con esos datos. ¿Quieres cambiar la ciudad, el presupuesto o el número de personas?');
    }
    s = paso(paso({ ...s, fase: 'ELIGIENDO', opciones }, 'BUSCAR', 'HECHO', `${opciones.length} opciones`), 'ELEGIR', 'EN_CURSO');
    const lista = opciones.map((o, i) => descripcionOpcion(o, i + 1)).join('\n');
    const rec = recomendar(opciones, s.criterios);
    const consejo = rec ? `\n\n${rec.motivo}` : '';
    return decir(s, 'agente', `Encontré estas opciones:\n${lista}${consejo}\n\nToca una o escribe su número.`);
  }

  /** ELEGIR -> VERIFICAR -> CONFIRMAR */
  async function elegir(e: EstadoAgente, indice: number): Promise<EstadoAgente> {
    const opcion = e.opciones[indice];
    const { checkIn, checkOut } = e.criterios;
    if (!opcion || !checkIn || !checkOut) return decir(e, 'agente', 'Esa opción no es válida. Elige una de la lista.');

    let s = paso(paso({ ...e, eleccion: opcion }, 'ELEGIR', 'HECHO', opcion.titulo), 'VERIFICAR', 'EN_CURSO');
    let disponible;
    try {
      disponible = await reservador.verificarDisponibilidad(opcion.unidadId, checkIn, checkOut);
    } catch (err) {
      s = paso({ ...s, eleccion: null, fase: 'ELIGIENDO' }, 'VERIFICAR', 'FALLIDO', mensajeDeError(err));
      return decir(s, 'agente', 'No pude verificar la disponibilidad. Elige de nuevo o inténtalo en un momento.');
    }
    if (disponible === 'NO') {
      const restantes = e.opciones.filter((_, i) => i !== indice);
      s = paso({ ...s, eleccion: null, opciones: restantes, fase: restantes.length ? 'ELIGIENDO' : 'CONVERSANDO' }, 'VERIFICAR', 'FALLIDO', 'No disponible');
      return decir(
        s,
        'agente',
        restantes.length
          ? 'Esa opción ya no está disponible en tus fechas. Elige otra de la lista.'
          : 'Ninguna opción está disponible en esas fechas. ¿Probamos otras fechas?',
      );
    }

    const noches = reservador.noches(checkIn, checkOut) ?? 0;
    const total = noches * opcion.precioNoche;
    const aviso = disponible === 'DESCONOCIDA' ? '\n⚠ Sin conexión: la disponibilidad se confirmará al enviar la reserva.' : '';
    s = paso(paso(s, 'VERIFICAR', 'HECHO', disponible === 'SI' ? 'Disponible' : 'Sin verificar'), 'CONFIRMAR', 'EN_CURSO');
    return decir(
      { ...s, fase: 'CONFIRMANDO' },
      'agente',
      `Resumen:\n${opcion.titulo} – ${opcion.unidadNombre}\n${checkIn} → ${checkOut} (${noches} noche${noches === 1 ? '' : 's'})\n` +
        `${e.criterios.huespedes} persona${e.criterios.huespedes === 1 ? '' : 's'} · Total Bs ${total.toFixed(2)}${aviso}\n\n¿Confirmo la reserva? (sí / no)`,
    );
  }

  /** Datos nuevos del usuario: valida fechas y retoma el plan donde corresponda. */
  async function conNuevosDatos(e: EstadoAgente, texto: string): Promise<EstadoAgente> {
    let s = paso(e, 'ENTENDER', 'EN_CURSO');
    let nuevo;
    try {
      nuevo = await motor.extraerIntencion(texto, s.criterios);
    } catch (err) {
      s = paso(s, 'ENTENDER', 'FALLIDO', mensajeDeError(err));
      return decir(s, 'agente', 'No logré entender tu mensaje. Prueba con algo como: "2 personas en Cochabamba del 12 al 15 de diciembre".');
    }
    if (!haySoloDatosNuevos(nuevo)) {
      s = paso(s, 'ENTENDER', 'PENDIENTE');
      const falta = faltantes(s.criterios)[0];
      return decir(s, 'agente', falta ? `No entendí ese dato. ${preguntaPara(falta)}` : 'No entendí. ¿Qué quieres cambiar?');
    }

    const criterios = mezclar(s.criterios, nuevo);
    s = paso({ ...s, criterios }, 'ENTENDER', 'HECHO');

    // Las fechas inválidas se descartan y se avisa por qué.
    if (criterios.checkIn && criterios.checkOut) {
      const problema = reservador.validarFechas(criterios.checkIn, criterios.checkOut);
      if (problema) {
        const { checkIn: _a, checkOut: _b, ...sinFechas } = criterios;
        s = decir({ ...s, criterios: sinFechas as Criterios }, 'agente', problema);
      }
    }
    // Cambió algo: el plan se retoma desde completar datos.
    s = { ...s, plan: reiniciarDesde(s.plan, 'COMPLETAR_DATOS'), eleccion: null, opciones: [] };
    return completarOBuscar(s);
  }

  // --- API pública -----------------------------------------------------------
  return {
    iniciar: inicial,

    async enviarMensaje(estado, texto) {
      const limpio = texto.trim();
      if (!limpio) return estado;
      const e = decir(estado, 'usuario', limpio);

      switch (e.fase) {
        case 'RESERVADO':
        case 'EN_COLA':
        case 'TERMINADO':
          return decir(e, 'agente', 'Esta reserva ya está lista. Para hacer otra, toca "Nueva reserva".');

        case 'CONFIRMANDO': {
          const r = interpretarConfirmacion(limpio);
          if (r === 'SI') return this.confirmar(e);
          if (r === 'NO') return this.rechazar(e);
          return decir(e, 'agente', 'Necesito un "sí" o un "no" para continuar.');
        }

        case 'ELIGIENDO': {
          const n = interpretarEleccion(limpio, e.opciones.length);
          if (n !== null) return elegir(e, n);
          return conNuevosDatos(e, limpio); // quizá cambió ciudad, fechas o presupuesto
        }

        default:
          return conNuevosDatos(e, limpio);
      }
    },

    elegirOpcion(estado, indice) {
      if (estado.fase !== 'ELIGIENDO') return Promise.resolve(estado);
      return elegir(estado, indice);
    },

    async confirmar(estado) {
      const opcion = estado.eleccion;
      const { checkIn, checkOut, huespedes } = estado.criterios;
      if (estado.fase !== 'CONFIRMANDO' || !opcion || !checkIn || !checkOut || !huespedes) return estado;

      let s = paso(paso(estado, 'CONFIRMAR', 'HECHO', 'Confirmado por el usuario'), 'RESERVAR', 'EN_CURSO');
      try {
        const r = await reservador.reservar(opcion, { checkIn, checkOut, huespedes });
        if (r.tipo === 'CREADA') {
          s = paso(paso({ ...s, fase: 'RESERVADO', reservaId: r.reservaId }, 'RESERVAR', 'HECHO', 'Reserva creada'), 'PAGAR', 'EN_CURSO', 'Págalo desde la pantalla de pago');
          return decir(s, 'agente', `¡Listo! Tu reserva quedó creada (total Bs ${r.total.toFixed(2)}). Tienes unos minutos para pagarla: toca "Pagar ahora".`);
        }
        s = paso(paso({ ...s, fase: 'EN_COLA', claveCola: r.clave }, 'RESERVAR', 'HECHO', 'Guardada sin internet'), 'PAGAR', 'BLOQUEADO', 'Se podrá pagar cuando la reserva se envíe');
        return decir(s, 'agente', 'No hay internet, pero guardé tu reserva y se enviará sola cuando vuelva la conexión. Después podrás pagarla.');
      } catch (err) {
        s = paso({ ...s, fase: 'CONFIRMANDO' }, 'RESERVAR', 'FALLIDO', mensajeDeError(err));
        return decir(s, 'agente', `No pude crear la reserva: ${mensajeDeError(err)} ¿Lo intento de nuevo? (sí / no)`);
      }
    },

    rechazar(estado) {
      if (estado.fase !== 'CONFIRMANDO') return estado;
      const s: EstadoAgente = {
        ...estado,
        fase: 'CONVERSANDO',
        eleccion: null,
        opciones: [],
        plan: reiniciarDesde(estado.plan, 'ELEGIR'),
      };
      return decir(s, 'agente', 'De acuerdo, no reservé nada. Dime qué quieres cambiar (ciudad, fechas, personas o presupuesto).');
    },
  };
}
