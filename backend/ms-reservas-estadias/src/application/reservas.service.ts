import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IReservasRepository } from '../domain/interfaces/reservas-repository.interface';
import { ReservaEntity } from '../domain/entities/reserva.entity';
import { BloqueoInventarioEntity } from '../domain/entities/inventario.entity';
import { EstadoReserva } from '../domain/enums/estado-reserva.enum';
import { CrearReservaDto } from './dtos/crear-reserva.dto';
import { ConfirmarPagoDto } from './dtos/confirmar-pago.dto';
import { RealizarCheckInDto } from './dtos/checkin.dto';
import { RabbitMQSagaService } from '../infrastructure/rabbitmq/rabbitmq-saga.service';
import { DynamoDBReservasRepository } from '../infrastructure/dynamodb/dynamodb-reservas.repository';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private readonly repository: DynamoDBReservasRepository,
    private readonly sagaService: RabbitMQSagaService,
  ) {}

  async crearSolicitudReserva(dto: CrearReservaDto): Promise<ReservaEntity> {
    const fechaIn = new Date(dto.checkIn);
    const fechaOut = new Date(dto.checkOut);

    if (isNaN(fechaIn.getTime()) || isNaN(fechaOut.getTime())) {
      throw new BadRequestException('Fechas de check-in o check-out inválidas.');
    }

    if (fechaIn >= fechaOut) {
      throw new BadRequestException('La fecha de check-in debe ser estrictamente anterior a la de check-out.');
    }

    const diffTime = Math.abs(fechaOut.getTime() - fechaIn.getTime());
    const nochesEstadia = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nochesEstadia <= 0) {
      throw new BadRequestException('La estadía debe tener al menos 1 noche.');
    }

    // Verificar disponibilidad en rango
    const bloqueosExistentes = await this.repository.obtenerBloqueosPorRango(dto.idUnidad, dto.checkIn, dto.checkOut);
    if (bloqueosExistentes.length > 0) {
      throw new BadRequestException(`La unidad reservable no se encuentra disponible en las fechas seleccionadas.`);
    }

    const idReserva = uuidv4();
    const sagaId = uuidv4();
    const codigoCheckin = Math.floor(100000 + Math.random() * 900000).toString();
    const cantidadUnidades = dto.cantidadUnidades || 1;
    const importeTotal = Number((nochesEstadia * dto.precioNoche * cantidadUnidades).toFixed(2));
    const ahoraIso = new Date().toISOString();
    // TTL en epoch seconds (15 minutos para completar pago)
    const ttlEpoch = Math.floor(Date.now() / 1000) + 15 * 60;

    const reserva = new ReservaEntity({
      idReserva,
      idCliente: dto.idCliente,
      nombreCliente: dto.nombreCliente,
      idAnfitrion: dto.idAnfitrion,
      idAlojamiento: dto.idAlojamiento,
      tituloAlojamiento: dto.tituloAlojamiento,
      idUnidad: dto.idUnidad,
      nombreUnidad: dto.nombreUnidad,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      nochesEstadia,
      cantidadHuespedes: dto.cantidadHuespedes,
      cantidadUnidades,
      precioNoche: dto.precioNoche,
      importeTotal,
      moneda: 'BOB',
      estado: EstadoReserva.PENDIENTE_PAGO,
      codigoCheckin,
      sagaId,
      idempotencyKey: dto.idempotencyKey || uuidv4(),
      version: 1,
      ttl: ttlEpoch,
      historialEventos: [
        {
          tipoEvento: 'RESERVA_INICIADA',
          origen: 'ms-reservas-estadias',
          fechaEvento: ahoraIso,
          payload: { importeTotal, nochesEstadia },
        },
      ],
      fechaCreacion: ahoraIso,
      fechaActualizacion: ahoraIso,
    });

    // Guardar bloqueos de fechas en inventario
    const fechas = this.generarRangoFechas(dto.checkIn, dto.checkOut);
    for (const f of fechas) {
      await this.repository.guardarBloqueo(
        new BloqueoInventarioEntity({
          idUnidad: dto.idUnidad,
          fecha: f,
          cantidadOcupada: cantidadUnidades,
          motivo: 'RESERVA_EN_CURSO',
          idReserva,
          fechaCreacion: ahoraIso,
        }),
      );
    }

    const guardada = await this.repository.guardarReserva(reserva);

    // Emitir evento SAGA hacia MS-03 Pagos vía RabbitMQ
    await this.sagaService.publicarEvento('reserva.creada', {
      idReserva: guardada.idReserva,
      sagaId: guardada.sagaId,
      idCliente: guardada.idCliente,
      idAnfitrion: guardada.idAnfitrion,
      montoTotal: guardada.importeTotal,
      moneda: guardada.moneda,
      tituloAlojamiento: guardada.tituloAlojamiento,
      checkIn: guardada.checkIn,
      checkOut: guardada.checkOut,
    });

    this.logger.log(`Solicitud de Reserva creada: ${idReserva} por BOB ${importeTotal}`);
    return guardada;
  }

  async confirmarPagoSaga(idReserva: string, dto: ConfirmarPagoDto): Promise<ReservaEntity> {
    const reserva = await this.obtenerReservaPorId(idReserva);

    if (reserva.estado !== EstadoReserva.PENDIENTE_PAGO) {
      throw new BadRequestException(`La reserva no puede ser confirmada en su estado actual: ${reserva.estado}`);
    }

    reserva.estado = EstadoReserva.CONFIRMADA;
    reserva.ttl = undefined; // Se cancela la autoexpiración porque ya pagó
    reserva.fechaActualizacion = new Date().toISOString();

    if (!reserva.historialEventos) reserva.historialEventos = [];
    reserva.historialEventos.push({
      tipoEvento: 'PAGO_CONFIRMADO_SAGA',
      origen: 'ms-comercial-financiero',
      fechaEvento: reserva.fechaActualizacion,
      payload: { ...dto },
    });

    const guardada = await this.repository.guardarReserva(reserva);

    await this.sagaService.publicarEvento('reserva.confirmada', {
      idReserva: guardada.idReserva,
      sagaId: guardada.sagaId,
      idCliente: guardada.idCliente,
      codigoCheckin: guardada.codigoCheckin,
    });

    this.logger.log(`Reserva ${idReserva} CONFIRMADA exitosamente por pago ${dto.pagoId}`);
    return guardada;
  }

  async cancelarOCompensarReserva(idReserva: string, motivo: string): Promise<ReservaEntity> {
    const reserva = await this.obtenerReservaPorId(idReserva);

    // Liberar bloqueos de fechas
    await this.repository.eliminarBloqueoPorReserva(reserva.idUnidad, idReserva);

    reserva.estado = EstadoReserva.CANCELADA;
    reserva.fechaActualizacion = new Date().toISOString();
    if (!reserva.historialEventos) reserva.historialEventos = [];
    reserva.historialEventos.push({
      tipoEvento: 'RESERVA_CANCELADA_COMPENSADA',
      origen: 'ms-reservas-estadias',
      fechaEvento: reserva.fechaActualizacion,
      payload: { motivo },
    });

    const guardada = await this.repository.guardarReserva(reserva);

    await this.sagaService.publicarEvento('reserva.compensada', {
      idReserva: guardada.idReserva,
      sagaId: guardada.sagaId,
      motivo,
    });

    this.logger.log(`Reserva ${idReserva} cancelada y fechas liberadas en inventario.`);
    return guardada;
  }

  async realizarCheckIn(idReserva: string, dto: RealizarCheckInDto): Promise<ReservaEntity> {
    const reserva = await this.obtenerReservaPorId(idReserva);

    if (reserva.estado !== EstadoReserva.CONFIRMADA) {
      throw new BadRequestException('Para hacer check-in la reserva debe estar en estado CONFIRMADA.');
    }

    if (reserva.codigoCheckin !== dto.codigoCheckin.trim()) {
      throw new BadRequestException('El código PIN de check-in ingresado es incorrecto.');
    }

    reserva.estado = EstadoReserva.CHECKIN_REALIZADO;
    reserva.fechaActualizacion = new Date().toISOString();
    reserva.detalleEstadia = {
      checkinConfirmadoEn: reserva.fechaActualizacion,
      notasHuesped: dto.notasHuesped,
      codigoVerificado: true,
    };

    return await this.repository.guardarReserva(reserva);
  }

  async finalizarCheckOut(idReserva: string): Promise<ReservaEntity> {
    const reserva = await this.obtenerReservaPorId(idReserva);

    if (reserva.estado !== EstadoReserva.CHECKIN_REALIZADO && reserva.estado !== EstadoReserva.CONFIRMADA) {
      throw new BadRequestException('No se puede finalizar check-out para una reserva no activa.');
    }

    reserva.estado = EstadoReserva.COMPLETADA;
    reserva.fechaActualizacion = new Date().toISOString();
    if (!reserva.detalleEstadia) reserva.detalleEstadia = {};
    reserva.detalleEstadia.checkoutConfirmadoEn = reserva.fechaActualizacion;

    const guardada = await this.repository.guardarReserva(reserva);

    // Emitir evento para MS-04 Reseñas e IA
    await this.sagaService.publicarEvento('estadia.completada', {
      idReserva: guardada.idReserva,
      idCliente: guardada.idCliente,
      idAnfitrion: guardada.idAnfitrion,
      idAlojamiento: guardada.idAlojamiento,
    });

    return guardada;
  }

  async verificarDisponibilidad(idUnidad: string, checkIn: string, checkOut: string): Promise<{ disponible: boolean; fechasBloqueadas: string[] }> {
    const bloqueos = await this.repository.obtenerBloqueosPorRango(idUnidad, checkIn, checkOut);
    return {
      disponible: bloqueos.length === 0,
      fechasBloqueadas: bloqueos.map((b) => b.fecha),
    };
  }

  async obtenerReservaPorId(idReserva: string): Promise<ReservaEntity> {
    const reserva = await this.repository.buscarReservaPorId(idReserva);
    if (!reserva) {
      throw new NotFoundException(`Reserva con id ${idReserva} no encontrada.`);
    }
    return reserva;
  }

  async listarPorCliente(idCliente: string): Promise<ReservaEntity[]> {
    return this.repository.listarReservasPorCliente(idCliente);
  }

  async listarPorAnfitrion(idAnfitrion: string): Promise<ReservaEntity[]> {
    return this.repository.listarReservasPorAnfitrion(idAnfitrion);
  }

  async listarTodas(): Promise<ReservaEntity[]> {
    return this.repository.listarTodas();
  }

  private generarRangoFechas(inicio: string, fin: string): string[] {
    const lista: string[] = [];
    const cur = new Date(inicio);
    const end = new Date(fin);

    while (cur < end) {
      lista.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return lista;
  }
}
