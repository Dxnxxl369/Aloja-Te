// ======================================================================
// ARCHIVO: anfitrion/domain/modelos.ts
// QUÉ ES: Modelos de dominio para el panel anfitrión en móvil.
// ======================================================================

export interface ResumenKpis {
  ingresosTotales: number;
  reservasTotales: number;
  alojamientosActivos: number;
  tasaOcupacion: number;
}

export interface ReservaRecienteAnfitrion {
  id: string;
  huespedNombre: string;
  alojamientoTitulo: string;
  alojamientoId?: string;
  unidadNombre?: string;
  checkIn: string;
  checkOut: string;
  total: number;
  estado: string;
  codigoCheckin?: string;
}

export interface UnidadAlojamiento {
  id: string;
  nombre: string;
  capacidad: number;
  precioNoche: number;
  estado?: string;
}

export interface PropiedadAnfitrion {
  id: string;
  titulo: string;
  tipoPropiedadNombre: string;
  modalidad?: 'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL' | string;
  descripcion?: string;
  direccion?: string;
  ciudad: string;
  departamento: string;
  precioNoche: number;
  estadoPublicacion: 'PUBLICADO' | 'EN_REVISION' | 'OBSERVADO' | 'RECHAZADO' | 'BORRADOR';
  motivoObservacion?: string;
  fotoPrincipal?: string;
  fotos?: string[];
  unidadesCount: number;
  unidades?: UnidadAlojamiento[];
}

export interface LiquidacionAnfitrion {
  id: string;
  fecha: string;
  montoNeto: number;
  comision: number;
  montoBruto: number;
  estado: 'DESEMBOLSADO' | 'PENDIENTE' | 'PROCESANDO';
  referencia: string;
  tituloAlojamiento?: string;
  huespedNombre?: string;
}

export interface PerfilAnfitrionDetalle {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ci: string;
  ciExpedido: string;
  ciAnversoUrl: string | null;
  ciReversoUrl: string | null;
  bancoNombre: string;
  numeroCuentaBancaria: string;
  qr: string | null;
  estado: string;
}
