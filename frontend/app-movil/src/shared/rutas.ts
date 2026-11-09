// ======================================================================
// ARCHIVO: shared/rutas.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Las rutas del servidor que usa más de un feature.
// PARA QUÉ SIRVE: Escribir cada ruta compartida en UN solo lugar (antes estaba copiada en agente, catálogo y la ficha de la reserva).
// SIN ÉL: Cada feature repetiría la ruta y un cambio había que hacerlo tres veces.
// NO VA AQUÍ: Rutas de un solo feature (van en su constantes.ts) ni lógica.
// ======================================================================
// Está en shared (y no en core) a propósito: es liviano y no arrastra la base de datos ni React Native,
// así la lógica de cada feature se puede probar sin el celular.

/** MS-01 vía Gateway (AlojamientoController: @RequestMapping("/api/v1/alojamientos")). */
export const RUTA_ALOJAMIENTOS = '/api/v1/alojamientos';
