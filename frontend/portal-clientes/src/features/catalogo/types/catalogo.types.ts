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
}

export interface Fotografia {
  idFotografia: string;
  url: string;
  esPrincipal: boolean;
  orden: number;
  descripcion?: string;
}

export interface ServicioAlojamiento {
  idServicio: number;
  nombre: string;
  categoria: string;
  icono?: string;
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
  tipoEspacio?: string;
  modalidad?: 'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL' | string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
  motivoRechazo?: string;
  precioBaseNoche: number;
  moneda: string;
  calificacionPromedio: number;
  totalResenas: number;
  estado: string;
  estadoPublicacion?: string;
  fotografias: Fotografia[];
  unidades: UnidadReservable[];
  servicios: ServicioAlojamiento[];
}
