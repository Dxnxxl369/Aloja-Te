export type EstadoPublicacion = 'PENDIENTE' | 'EN_REVISION' | 'PUBLICADO' | 'OBSERVADO' | 'SUSPENDIDO' | 'RECHAZADO';

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
  estado: EstadoPublicacion;
  estadoPublicacion?: EstadoPublicacion;
  motivoObservacionRechazo?: string;
  origenUltimoCambio?: string;
  fotografias: Fotografia[];
  unidades: UnidadReservable[];
  servicios: ServicioAlojamiento[];
}

export interface ValoracionCliente {
  idValoracion: string;
  idAlojamiento: string;
  idUnidad?: string;
  idUsuario: string;
  nombreUsuario?: string;
  puntuacionGeneral: number;
  calificacionLimpieza?: number;
  calificacionUbicacion?: number;
  calificacionCalidadPrecio?: number;
  calificacionServicio?: number;
  calificacionComodidad?: number;
  esAnonimo: boolean;
  comentario: string;
  sentimientoNlp?: string;
  confianzaNlp?: number;
  topicoPredicho?: string;
  fechaCreacion?: string;
}

export interface ResumenValoraciones {
  calificacionPromedio: number;
  totalResenas: number;
  promedioLimpieza: number;
  promedioUbicacion: number;
  promedioCalidadPrecio: number;
  promedioServicio: number;
  promedioComodidad: number;
  conteoPositivos: number;
  conteoNeutros: number;
  conteoNegativos: number;
}
