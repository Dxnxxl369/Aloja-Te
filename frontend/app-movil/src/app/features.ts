// ======================================================================
// ARCHIVO: app/features.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Donde se arman los tres features con las piezas de core.
// PARA QUÉ SIRVE: Un solo lugar que conoce a todos; los features no se conocen entre sí salvo por sus index.
// SIN ÉL: Nadie entregaría `api`, `cola` y `modeloLocal` a los features.
// NO VA AQUÍ: Lógica ni pantallas. Solo conectar.
// ======================================================================
// Llamar UNA vez, ANTES de iniciarCore():
//   const features = crearFeatures();
//   await iniciarCore();
// (los features registran sus manejadores de la cola offline; el sincronizador, al arrancar,
//  los necesita ya registrados para enviar lo que quedó pendiente de la sesión anterior).

import { api, auth, cola, guardarCache, leerCache, modeloLocal, nuevoId, PAGO_SIMULADO_HABILITADO } from '../core';
import { crearFeatureAgente } from '../features/agente';
import { crearFeatureCatalogo } from '../features/catalogo';
import { crearFeaturePagos } from '../features/pagos';
import { crearFeatureReservas } from '../features/reservas';
import { crearFichaAlojamiento } from './fichaAlojamiento';

export function crearFeatures() {
  const reservas = crearFeatureReservas({ api, cola, nuevoId, guardarCache, leerCache });
  const pagos = crearFeaturePagos({ api, simulacionHabilitada: PAGO_SIMULADO_HABILITADO });
  const agente = crearFeatureAgente({
    api,
    reservas: reservas.casos,
    modeloLocal,
    obtenerCliente: async () => {
      const s = await auth.sesionActual();
      if (!s) throw new Error('Inicia sesión para reservar.');
      return { id: s.usuarioId, nombre: s.nombre };
    },
  });
  const catalogo = crearFeatureCatalogo({ api, guardarCache, leerCache });
  const fichaAlojamiento = crearFichaAlojamiento({ api, guardarCache, leerCache });
  return { reservas, pagos, agente, catalogo, fichaAlojamiento };
}

export type Features = ReturnType<typeof crearFeatures>;
