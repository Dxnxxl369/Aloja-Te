import { Injectable, Logger } from '@nestjs/common';
import { IReservasRepository } from '../../domain/interfaces/reservas-repository.interface';
import { ReservaEntity } from '../../domain/entities/reserva.entity';
import { BloqueoInventarioEntity } from '../../domain/entities/inventario.entity';
import { DynamoDBService } from './dynamodb.service';
import { PutCommand, GetCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBReservasRepository implements IReservasRepository {
  private readonly logger = new Logger(DynamoDBReservasRepository.name);

  // In-memory fallback storage
  private readonly memoryReservas: Map<string, ReservaEntity> = new Map();
  private readonly memoryBloqueos: Map<string, BloqueoInventarioEntity> = new Map();

  constructor(private readonly dynamoService: DynamoDBService) { }

  async guardarReserva(reserva: ReservaEntity): Promise<ReservaEntity> {
    this.memoryReservas.set(reserva.idReserva, reserva);

    if (this.dynamoService.isAvailable()) {
      try {
        await this.dynamoService.getDocClient().send(
          new PutCommand({
            TableName: this.dynamoService.getTableName(),
            Item: { ...reserva },
          }),
        );
        return reserva;
      } catch (err: any) {
        this.logger.warn(`Fallo al escribir en DynamoDB: ${err.message}. Guardando en memoria.`);
      }
    }

    return reserva;
  }

  async buscarReservaPorId(idReserva: string): Promise<ReservaEntity | null> {
    this.purgarExpiradas();
    if (this.dynamoService.isAvailable()) {
      try {
        const response = await this.dynamoService.getDocClient().send(
          new GetCommand({
            TableName: this.dynamoService.getTableName(),
            Key: {
              pk: `RESERVA#${idReserva}`,
              sk: 'METADATA',
            },
          }),
        );
        if (response.Item) {
          const itemRes = new ReservaEntity(response.Item as Partial<ReservaEntity>);
          const nowEpoch = Math.floor(Date.now() / 1000);
          if (itemRes.estado === 'PENDIENTE_PAGO' && itemRes.ttl && itemRes.ttl <= nowEpoch) {
            itemRes.estado = 'EXPIRADA' as any;
            await this.eliminarBloqueoPorReserva(itemRes.idUnidad, itemRes.idReserva);
          }
          return itemRes;
        }
      } catch (err: any) {
        this.logger.warn(`Error al consultar DynamoDB: ${err.message}. Buscando en memoria.`);
      }
    }

    const item = this.memoryReservas.get(idReserva);
    if (!item) return null;

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (item.estado === 'PENDIENTE_PAGO' && item.ttl && item.ttl <= nowEpoch) {
      item.estado = 'EXPIRADA' as any;
      await this.eliminarBloqueoPorReserva(item.idUnidad, item.idReserva);
    }
    return new ReservaEntity(item);
  }

  async listarReservasPorCliente(idCliente: string): Promise<ReservaEntity[]> {
    this.purgarExpiradas();
    if (this.dynamoService.isAvailable()) {
      try {
        const response = await this.dynamoService.getDocClient().send(
          new QueryCommand({
            TableName: this.dynamoService.getTableName(),
            IndexName: 'GSI1_Cliente',
            KeyConditionExpression: 'gsi1Pk = :clientePk',
            ExpressionAttributeValues: {
              ':clientePk': `CLIENTE#${idCliente}`,
            },
          }),
        );
        if (response.Items && response.Items.length > 0) {
          return response.Items.map((item) => new ReservaEntity(item as Partial<ReservaEntity>));
        }
      } catch (err: any) {
        this.logger.warn(`Error en consulta GSI DynamoDB: ${err.message}. Filtrando en memoria.`);
      }
    }

    return Array.from(this.memoryReservas.values())
      .filter((r) => r.idCliente === idCliente)
      .map((r) => new ReservaEntity(r));
  }

  async listarReservasPorAnfitrion(idAnfitrion: string): Promise<ReservaEntity[]> {
    this.purgarExpiradas();
    if (this.dynamoService.isAvailable()) {
      try {
        const response = await this.dynamoService.getDocClient().send(
          new ScanCommand({
            TableName: this.dynamoService.getTableName(),
            FilterExpression: 'idAnfitrion = :anfitrionId AND sk = :meta',
            ExpressionAttributeValues: {
              ':anfitrionId': idAnfitrion,
              ':meta': 'METADATA',
            },
          }),
        );
        if (response.Items) {
          return response.Items.map((item) => new ReservaEntity(item as Partial<ReservaEntity>));
        }
      } catch (err: any) {
        this.logger.warn(`Error en Scan DynamoDB: ${err.message}. Filtrando en memoria.`);
      }
    }

    return Array.from(this.memoryReservas.values())
      .filter((r) => r.idAnfitrion === idAnfitrion)
      .map((r) => new ReservaEntity(r));
  }

  async listarReservasPorUnidad(idUnidad: string): Promise<ReservaEntity[]> {
    this.purgarExpiradas();
    return Array.from(this.memoryReservas.values())
      .filter((r) => r.idUnidad === idUnidad)
      .map((r) => new ReservaEntity(r));
  }

  async listarTodas(): Promise<ReservaEntity[]> {
    this.purgarExpiradas();
    if (this.dynamoService.isAvailable()) {
      try {
        const response = await this.dynamoService.getDocClient().send(
          new ScanCommand({
            TableName: this.dynamoService.getTableName(),
            FilterExpression: 'sk = :meta',
            ExpressionAttributeValues: {
              ':meta': 'METADATA',
            },
          }),
        );
        if (response.Items) {
          return response.Items.map((item) => new ReservaEntity(item as Partial<ReservaEntity>));
        }
      } catch (err: any) {
        this.logger.warn(`Error en Scan DynamoDB: ${err.message}. Usando memoria.`);
      }
    }

    return Array.from(this.memoryReservas.values()).map((r) => new ReservaEntity(r));
  }

  // --- INVENTARIO Y BLOQUEOS ---
  async guardarBloqueo(bloqueo: BloqueoInventarioEntity): Promise<BloqueoInventarioEntity> {
    const key = `${bloqueo.idUnidad}#${bloqueo.fecha}`;
    if (this.dynamoService.isAvailable()) {
      try {
        await this.dynamoService.getDocClient().send(
          new PutCommand({
            TableName: this.dynamoService.getTableName(),
            Item: { ...bloqueo },
          }),
        );
        return bloqueo;
      } catch (err: any) {
        this.logger.warn(`Error al guardar bloqueo en DynamoDB: ${err.message}`);
      }
    }

    this.memoryBloqueos.set(key, bloqueo);
    return bloqueo;
  }

  async eliminarBloqueoPorReserva(idUnidad: string, idReserva: string): Promise<void> {
    for (const [key, bloqueo] of this.memoryBloqueos.entries()) {
      if (bloqueo.idUnidad === idUnidad && bloqueo.idReserva === idReserva) {
        this.memoryBloqueos.delete(key);
      }
    }
  }

  /**
   * Purgado reactivo de reservas en PENDIENTE_PAGO cuyo TTL de 15 minutos ya expiró.
   * Libera automáticamente el inventario sin requerir jobs externos.
   */
  public purgarExpiradas(): void {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const idsExpirados: string[] = [];

    for (const [id, reserva] of this.memoryReservas.entries()) {
      if (reserva.estado === 'PENDIENTE_PAGO' && reserva.ttl && reserva.ttl <= nowEpoch) {
        reserva.estado = 'EXPIRADA' as any;
        reserva.fechaActualizacion = new Date().toISOString();
        idsExpirados.push(id);
      }
    }

    if (idsExpirados.length > 0) {
      for (const [key, bloqueo] of this.memoryBloqueos.entries()) {
        if (bloqueo.idReserva && idsExpirados.includes(bloqueo.idReserva)) {
          this.memoryBloqueos.delete(key);
        }
      }
      this.logger.log(`[Auto-Purga TTL] ${idsExpirados.length} reservas expiradas purgadas de inventario.`);
    }
  }

  async obtenerBloqueosPorRango(idUnidad: string, fechaInicio: string, fechaFin: string): Promise<BloqueoInventarioEntity[]> {
    // 1. Ejecutar purga de reservas vencidas por temporizador de 15 minutos
    this.purgarExpiradas();

    const nowEpoch = Math.floor(Date.now() / 1000);

    // 2. Filtrar bloqueos directos verificando que no pertenezcan a reservas canceladas o expiradas
    const bloqueosDirectos = Array.from(this.memoryBloqueos.values()).filter((b) => {
      if (b.idUnidad !== idUnidad || b.fecha < fechaInicio || b.fecha >= fechaFin) {
        return false;
      }
      if (b.idReserva) {
        const resAsociada = this.memoryReservas.get(b.idReserva);
        if (resAsociada) {
          if (resAsociada.estado === 'CANCELADA' || resAsociada.estado === 'EXPIRADA') {
            return false;
          }
          if (resAsociada.estado === 'PENDIENTE_PAGO' && resAsociada.ttl && resAsociada.ttl <= nowEpoch) {
            return false;
          }
        }
      }
      return true;
    });

    if (bloqueosDirectos.length > 0) {
      return bloqueosDirectos;
    }

    // 3. Verificar también en reservas activas de la unidad
    const reservasOcupadas = Array.from(this.memoryReservas.values()).filter((r) => {
      if (r.idUnidad !== idUnidad) return false;
      if (r.estado === 'CANCELADA' || r.estado === 'EXPIRADA') return false;
      if (r.estado === 'PENDIENTE_PAGO' && r.ttl && r.ttl <= nowEpoch) return false;
      return r.checkIn < fechaFin && r.checkOut > fechaInicio;
    });

    if (reservasOcupadas.length > 0) {
      return reservasOcupadas.map(
        (r) =>
          new BloqueoInventarioEntity({
            idUnidad,
            fecha: r.checkIn,
            idReserva: r.idReserva,
            cantidadOcupada: r.cantidadUnidades || 1,
            motivo: 'RESERVA_EN_CURSO',
          }),
      );
    }

    return [];
  }
}
