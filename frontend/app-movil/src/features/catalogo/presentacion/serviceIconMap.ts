// ======================================================================
// ARCHIVO: catalogo/presentacion/serviceIconMap.ts      IMPORTANCIA: ★ POCA
// QUÉ ES: La tabla que dice qué icono dibujar para cada tipo de servicio (wifi, piscina, estacionamiento…).
// PARA QUÉ SIRVE: Sacar de ServiciosGrid la lista de iconos: el componente solo pide el icono de cada servicio.
// SIN ÉL: ServiciosGrid tendría esta tabla escrita adentro.
// NO VA AQUÍ: Decidir qué tipo es cada servicio (eso es serviceIcons.ts) ni dibujar.
// ======================================================================
// Para un servicio nuevo: su clave en ServiceIconKey (serviceIcons.ts) y su icono aquí; TypeScript avisa si falta alguno.

import { Car, Check, Coffee, Dumbbell, Flame, PawPrint, ShowerHead, Snowflake, Tv, Utensils, Waves, Wifi } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ServiceIconKey } from './serviceIcons';

export const SERVICE_ICONS: Record<ServiceIconKey, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  breakfast: Coffee,
  airConditioning: Snowflake,
  parking: Car,
  tv: Tv,
  kitchen: Utensils,
  heating: Flame,
  gym: Dumbbell,
  pets: PawPrint,
  bath: ShowerHead,
  generic: Check,
};
