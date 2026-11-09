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
  checkIn: string;
  checkOut: string;
  total: number;
  estado: string;
}

export interface PropiedadAnfitrion {
  id: string;
  titulo: string;
  tipoPropiedadNombre: string;
  ciudad: string;
  departamento: string;
  precioNoche: number;
  estadoPublicacion: 'PUBLICADO' | 'EN_REVISION' | 'OBSERVADO' | 'RECHAZADO' | 'BORRADOR';
  motivoObservacion?: string;
  fotoPrincipal?: string;
  unidadesCount: number;
}

export interface LiquidacionAnfitrion {
  id: string;
  fecha: string;
  montoNeto: number;
  comision: number;
  montoBruto: number;
  estado: 'DESEMBOLSADO' | 'PENDIENTE' | 'PROCESANDO';
  referencia: string;
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
