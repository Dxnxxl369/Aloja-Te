// ======================================================================
// ARCHIVO: app/features.ts      IMPORTANCIA: ★★★ MUCHA
// QUÉ ES: Donde se arman los features con las piezas de core, y el contexto que se los entrega a las rutas.
// PARA QUÉ SIRVE: Un solo lugar que conoce a todos; los features no se conocen entre sí salvo por sus index.
// SIN ÉL: Nadie entregaría `api`, `cola` y `modeloLocal` a los features.
// NO VA AQUÍ: Lógica ni pantallas. Solo conectar.
// ======================================================================
// Llamar UNA vez, ANTES de iniciarCore():
//   const features = crearFeatures();
//   await iniciarCore();
// (los features registran sus manejadores de la cola offline; el sincronizador, al arrancar,
//  los necesita ya registrados para enviar lo que quedó pendiente de la sesión anterior).

import { createContext, useContext } from 'react';
import { AGENTE_LLM_HABILITADO, api, GROQ_API_KEY, auth, cola, guardarCache, leerCache, modeloLocal, nuevoId, PAGO_SIMULADO_HABILITADO } from '../core';
import { crearFeatureAgente } from '../features/agente';
import { crearRepositorioAnfitrion } from '../features/anfitrion';
import { crearFeatureCatalogo } from '../features/catalogo';
import { crearFeaturePagos } from '../features/pagos';
import { crearFeatureReservas } from '../features/reservas';
import { crearFichaAlojamiento } from './fichaAlojamiento';

export function crearFeatures() {
  const reservas = crearFeatureReservas({ api, cola, nuevoId, guardarCache, leerCache });
  const pagos = crearFeaturePagos({ api, simulacionHabilitada: PAGO_SIMULADO_HABILITADO });
  const catalogo = crearFeatureCatalogo({ api, guardarCache, leerCache });
  const agente = crearFeatureAgente({
    api,
    reservas: reservas.casos,
    modeloLocal,
    llmHabilitado: AGENTE_LLM_HABILITADO,
    groqApiKey: GROQ_API_KEY,
    obtenerDetalle: catalogo.casos.obtenerDetalle,
    obtenerCliente: async () => {
      const s = await auth.sesionActual();
      if (!s) throw new Error('Inicia sesión para reservar.');
      return { id: s.usuarioId, nombre: s.nombre };
    },
  });
  const fichaAlojamiento = crearFichaAlojamiento({ api, guardarCache, leerCache });
  const anfitrion = crearRepositorioAnfitrion({ api });
  return { reservas, pagos, agente, catalogo, fichaAlojamiento, anfitrion };
}

export type Features = ReturnType<typeof crearFeatures>;

/** Entrega los features a las rutas (app/routes/): cada una pide el que necesita con `useFeatures()` en vez de recibirlo por props. */
export const ContextoFeatures = createContext<Features | null>(null);

export function useFeatures(): Features {
  const f = useContext(ContextoFeatures);
  if (!f) throw new Error('useFeatures debe usarse dentro de <NavegacionApp>');
  return f;
}
