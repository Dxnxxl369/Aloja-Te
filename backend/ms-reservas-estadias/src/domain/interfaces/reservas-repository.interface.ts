import { ReservaEntity } from '../entities/reserva.entity';
import { BloqueoInventarioEntity } from '../entities/inventario.entity';

export interface IReservasRepository {
  guardarReserva(reserva: ReservaEntity): Promise<ReservaEntity>;
  buscarReservaPorId(idReserva: string): Promise<ReservaEntity | null>;
  listarReservasPorCliente(idCliente: string): Promise<ReservaEntity[]>;
  listarReservasPorAnfitrion(idAnfitrion: string): Promise<ReservaEntity[]>;
  listarReservasPorUnidad(idUnidad: string): Promise<ReservaEntity[]>;
  listarTodas(): Promise<ReservaEntity[]>;

  // Inventario y Bloqueos
  guardarBloqueo(bloqueo: BloqueoInventarioEntity): Promise<BloqueoInventarioEntity>;
  eliminarBloqueoPorReserva(idUnidad: string, idReserva: string): Promise<void>;
  obtenerBloqueosPorRango(idUnidad: string, fechaInicio: string, fechaFin: string): Promise<BloqueoInventarioEntity[]>;
}
