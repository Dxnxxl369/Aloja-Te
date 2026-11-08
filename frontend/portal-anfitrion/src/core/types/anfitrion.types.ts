export type EstadoOperativo = 'LIBRE' | 'PENDIENTE' | 'EN_USO';

export type EstadoPublicacion = 'PENDIENTE' | 'EN_REVISION' | 'PUBLICADO' | 'OBSERVADO' | 'SUSPENDIDO' | 'RECHAZADO';

export interface Fotografia {
  idFotografia: string;
  url: string;
  esPrincipal: boolean;
  orden: number;
  descripcion?: string;
}

export interface UnidadReservable {
  idUnidad: string;
  nombre: string;
  descripcion?: string;
  capacidadPersonas: number;
  cantidadDormitorios?: number;
  cantidadCamas: number;
  cantidadBanios: number;
  cantidadBanos?: number;
  precioNoche: number;
  moneda: string;
  inventarioTotal: number;
  activo: boolean;
  estado?: string;
  fotografias?: Fotografia[];
  fotos?: string[];
  servicios?: string[];
  estadoOperativo?: EstadoOperativo;
}

export interface ReservaItem {
  idReserva: string;
  huespedNombre: string;
  huespedTelefono: string;
  desde: string;
  hasta: string;
  pinSecreto: string;
  montoTotal: number;
  estado: EstadoOperativo | 'CONFIRMADA';
}

export interface Alojamiento {
  idAlojamiento: string;
  idAnfitrion: string;
  nombreAnfitrion?: string;
  titulo: string;
  descripcion: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  tipoPropiedad: string;
  modalidad?: 'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL' | string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
  precioBaseNoche: number;
  moneda: string;
  calificacionPromedio: number;
  totalResenas: number;
  estado: EstadoPublicacion;
  fotografias: Fotografia[];
  unidades: UnidadReservable[];
  // Propiedades operativas para el panel de recepción
  estadoOperativo?: EstadoOperativo;
  reservas?: ReservaItem[];
}

export interface PerfilAnfitrion {
  id: string;
  nombre: string;
  email: string;
  ciudad: string;
  descripcion: string;
  cuentaBNB: string;
  saldoDisponible: string;
  verificado: boolean;
  kpis: {
    ingresosNetos: string;
    tasaOcupacion: string;
    huespedesActivos: string;
    reputacion: string;
  };
}
