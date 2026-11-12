export type AdminTab = 'dashboard' | 'contabilidad' | 'alojamientos' | 'liquidaciones' | 'reportes-ia' | 'usuarios' | 'perfil';

export interface UsuarioAdmin {
  idUsuario: string;
  idRol?: number;
  rolNombre?: string;
  tipoCuenta?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  ci?: string;
  ciComplemento?: string;
  ciExpedido?: string;
  telefonoEmergencia?: string;
  direccionDomicilio?: string;
  departamentoRadicatoria?: string;
  bancoNombre?: string;
  numeroCuentaBancaria?: string;
  qr?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

export type FiltroAlojamientos =
  | 'TODOS'
  | 'PENDIENTE'
  | 'PENDIENTES'
  | 'EN_REVISION'
  | 'PUBLICADO'
  | 'PUBLICADOS'
  | 'OBSERVADO'
  | 'OBSERVADOS'
  | 'SUSPENDIDO'
  | 'SUSPENDIDOS'
  | 'RECHAZADO'
  | 'RECHAZADOS';

export interface MovimientoContable {
  movimientoId: number;
  asientoId: string;
  cuenta: string;
  tipo: 'DEBITO' | 'CREDITO';
  monto: number;
  origenTipo: string;
  createdAt: string;
}

export interface UnidadAdmin {
  idUnidad: string;
  nombre: string;
  capacidadHuespedes: number;
  cantidadCamas: number;
  cantidadBanos: number;
  inventarioTotal: number;
  precioNoche: number;
  estado: string; // 'DISPONIBLE' | 'OBSERVADO' | 'MANTENIMIENTO' | 'OCULTA'
  motivoObservacion?: string;
  motivoRechazo?: string;
  fotoObservadaIndex?: number;
  fotos?: string[];
  fotografias?: {
    idFotografia?: string;
    url: string;
    orden?: number;
    esPrincipal?: boolean;
    tipo?: string;
    categoria?: string;
    observacion?: string;
  }[];
  descripcion?: string;
}

export interface SolicitudAlojamiento {
  id: string;
  titulo: string;
  anfitrion: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  tipoPropiedad: string;
  modalidad: 'CASA_DEPARTAMENTO' | 'HOTEL_HOSTAL' | string;
  precioNoche: number;
  capacidad: number;
  habitaciones: number;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'PUBLICADO' | 'OBSERVADO' | 'SUSPENDIDO' | 'RECHAZADO';
  motivoObservacionRechazo?: string;
  origenUltimoCambio?: string;
  fechaRegistro: string;
  imagen: string;
  fotos?: string[];
  descripcion: string;
  politicas?: string;
  horarioEntrada?: string;
  horarioSalida?: string;
  motivoRechazo?: string;
  unidades?: UnidadAdmin[];
  servicios?: string[];
}

export interface LiquidacionAnfitrion {
  id: string;
  anfitrion: string;
  alojamiento: string;
  banco: string;
  numeroCuenta: string;
  montoBruto: number;
  comisionPlataforma: number;
  retencionImpuestos: number;
  montoNeto: number;
  estado: 'PAGADO' | 'PENDIENTE' | 'EN_PROCESO';
  fechaLiquidacion: string;
}

export interface ReporteGenerativo {
  titulo: string;
  categoria: string;
  periodo: string;
  fechaEmision: string;
  resumenEjecutivo: string;
  kpis: { etiqueta: string; valor: string; variacion: string; esPositivo: boolean }[];
  puntosClave: string[];
  recomendacionesEstrategicas: string[];
}

export interface ValoracionAdmin {
  idValoracion: string;
  idAlojamiento: string;
  idUnidad?: string;
  nombreUnidad?: string;
  idUsuario: string;
  nombreUsuario: string;
  puntuacionGeneral: number;
  calificacionLimpieza?: number;
  calificacionUbicacion?: number;
  calificacionCalidadPrecio?: number;
  calificacionServicio?: number;
  calificacionComodidad?: number;
  esAnonimo: boolean;
  comentario: string;
  sentimientoNlp?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | string;
  confianzaNlp?: number;
  topicoPredicho?: string;
  fechaCreacion: string;
}

export interface LightboxState {
  activo: boolean;
  urlActual: string;
  indiceActual: number;
  galeria: string[];
  titulo?: string;
  alertaObservacion?: string;
}
