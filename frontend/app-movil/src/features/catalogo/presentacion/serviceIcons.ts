// ======================================================================
// ARCHIVO: catalogo/presentacion/serviceIcons.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: Decide qué tipo de icono le toca a un servicio según su nombre ("Wifi de Alta Velocidad" → wifi, "Piscina Privada" → piscina).
// PARA QUÉ SIRVE: Sacar de ServiciosGrid esta tabla de palabras, que se puede probar sola, sin dibujar nada.
// SIN ÉL: ServiciosGrid tendría 15 líneas de expresiones regulares mezcladas con el dibujo.
// NO VA AQUÍ: Los iconos en sí (ServiciosGrid.tsx los elige por la clave que devuelve esto).
// ======================================================================
// Para un servicio nuevo: agregar su clave a ServiceIconKey, su regla aquí y su icono en ServiciosGrid.

export type ServiceIconKey =
  | 'wifi'
  | 'pool'
  | 'breakfast'
  | 'airConditioning'
  | 'parking'
  | 'tv'
  | 'kitchen'
  | 'heating'
  | 'gym'
  | 'pets'
  | 'bath'
  | 'generic';

/** Cada regla: si el nombre (sin tildes y en minúsculas) coincide, esa clave. Gana la primera que coincida. */
const RULES: [RegExp, ServiceIconKey][] = [
  [/wifi|internet|fibra/, 'wifi'],
  [/piscina|pileta|alberca/, 'pool'],
  [/desayuno|cafe/, 'breakfast'],
  [/aire|acondicionado|climatiz/, 'airConditioning'],
  [/estacionamiento|parqueo|parking|garaje|cochera/, 'parking'],
  [/tv|television|cable/, 'tv'],
  [/cocina|restaurante|comedor/, 'kitchen'],
  [/calefaccion|chimenea|calefactor/, 'heating'],
  [/gimnasio|gym/, 'gym'],
  [/mascota|pet/, 'pets'],
  [/ducha|bano|jacuzzi|spa/, 'bath'],
];

/** Clave del icono para el nombre de un servicio; `generic` si no se reconoce. */
export function serviceIconKey(name: string): ServiceIconKey {
  const normalized = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return RULES.find(([pattern]) => pattern.test(normalized))?.[1] ?? 'generic';
}
