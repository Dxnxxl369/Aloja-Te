import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ReservasService } from '../../application/reservas.service';
import { PagoConfirmadoEvento } from '../../application/dtos/pago-confirmado.evento';
import { PagosHttpClient } from '../http/pagos-http.client';

/** Exchange donde MS-03 publica sus eventos (RabbitMQSagaPublisher.php). */
const EXCHANGE_FINANZAS = 'alojate.reservas.saga';
const COLA = 'ms-reservas.pagos';
const RUTA_PAGO_CONFIRMADO = 'finanzas.pago.confirmado';

const ESPERA_RECONEXION_MS = 5_000;
const ESPERA_REINTENTO_MS = 5_000;
const MAX_REINTENTOS = 10;

/**
 * Saga por coreografía, lado MS-02: escucha los eventos de MS-03 y reacciona.
 *   finanzas.pago.confirmado  ->  la reserva pasa a CONFIRMADA (ReservasService.procesarPagoConfirmado)
 *                                 o, si ya no se puede honrar, se pide el reembolso a MS-03 (compensación)
 *
 * - No bloquea el arranque: si RabbitMQ no está, reintenta cada 5 s.
 * - Un fallo inesperado reintenta el mensaje (hasta MAX_REINTENTOS); los resultados de negocio se confirman (ack).
 */
@Injectable()
export class PagosSagaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PagosSagaConsumer.name);
  private connection: any = null;
  private channel: any = null;
  private cerrando = false;
  private temporizador: NodeJS.Timeout | null = null;
  private readonly intentos = new Map<string, number>();

  constructor(
    private readonly reservas: ReservasService,
    private readonly pagos: PagosHttpClient,
  ) {}

  onModuleInit(): void {
    void this.conectar();
  }

  async onModuleDestroy(): Promise<void> {
    this.cerrando = true;
    if (this.temporizador) clearTimeout(this.temporizador);
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      /* ya estaba cerrado */
    }
  }

  private async conectar(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.connection.on('error', (e: Error) => this.logger.warn(`RabbitMQ (consumidor): ${e.message}`));
      this.connection.on('close', () => this.programarReconexion());
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE_FINANZAS, 'topic', { durable: true });
      await this.channel.assertQueue(COLA, { durable: true });
      await this.channel.bindQueue(COLA, EXCHANGE_FINANZAS, RUTA_PAGO_CONFIRMADO);
      await this.channel.prefetch(1);
      await this.channel.consume(COLA, (msg: amqp.ConsumeMessage | null) => {
        if (msg) void this.manejar(msg);
      });
      this.logger.log(`[SAGA] Escuchando '${RUTA_PAGO_CONFIRMADO}' de MS-03 en la cola '${COLA}'`);
    } catch (e: any) {
      this.logger.warn(`[SAGA] RabbitMQ no disponible para escuchar pagos (${e.message}). Reintento en 5 s.`);
      this.programarReconexion();
    }
  }

  private programarReconexion(): void {
    if (this.cerrando || this.temporizador) return;
    this.connection = null;
    this.channel = null;
    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      void this.conectar();
    }, ESPERA_RECONEXION_MS);
  }

  private async manejar(msg: amqp.ConsumeMessage): Promise<void> {
    let eventoId = 'sin-id';
    try {
      const contenido = JSON.parse(msg.content.toString('utf8'));
      eventoId = String(contenido.eventoId ?? msg.fields.deliveryTag);
      if (contenido.tipoEvento !== 'pago.confirmado') {
        this.channel?.ack(msg);
        return;
      }

      const evento = contenido.payload as PagoConfirmadoEvento;
      if (!evento?.reservaId || !evento?.pagoId) {
        this.logger.error(`[SAGA] Evento ${eventoId} sin reservaId/pagoId: se descarta.`);
        this.channel?.ack(msg);
        return;
      }

      const resultado = await this.reservas.procesarPagoConfirmado(evento);
      this.logger.log(`[SAGA] pago ${evento.pagoId} -> reserva ${evento.reservaId}: ${resultado}`);
      if (resultado === 'REEMBOLSAR') {
        // Compensación: la reserva no se puede honrar, se devuelve el dinero. Si MS-03 no responde, se reintenta.
        const reembolso = await this.pagos.reembolsar(evento.reservaId, 'La reserva ya no está disponible');
        this.logger.warn(`[SAGA] Compensación del pago ${evento.pagoId} (reserva ${evento.reservaId}): ${reembolso}`);
      }
      this.intentos.delete(eventoId);
      this.channel?.ack(msg);
    } catch (e: any) {
      const n = (this.intentos.get(eventoId) ?? 0) + 1;
      this.intentos.set(eventoId, n);
      if (n >= MAX_REINTENTOS) {
        this.logger.error(`[SAGA] Evento ${eventoId} falló ${n} veces (${e.message}): se descarta. Revisar a mano.`);
        this.intentos.delete(eventoId);
        this.channel?.ack(msg);
        return;
      }
      this.logger.warn(`[SAGA] Evento ${eventoId} falló (${e.message}). Reintento ${n}/${MAX_REINTENTOS}.`);
      setTimeout(() => {
        try {
          this.channel?.nack(msg, false, true);
        } catch {
          /* el canal se cerró: RabbitMQ lo reentrega al reconectar */
        }
      }, ESPERA_REINTENTO_MS);
    }
  }
}
