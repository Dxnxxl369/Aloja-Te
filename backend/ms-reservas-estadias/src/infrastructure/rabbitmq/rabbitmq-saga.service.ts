import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQSagaService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQSagaService.name);
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  async onModuleInit() {
    await this.conectarRabbitMQ();
  }

  private async conectarRabbitMQ() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange('alojate.saga.exchange', 'topic', { durable: true });
      this.isConnected = true;
      this.logger.log('Conectado a RabbitMQ (SAGA Orchestration Exchange)');
    } catch (error: any) {
      this.logger.warn(`RabbitMQ no disponible en ${url}. Modo SAGA desacoplado / emulación de eventos activo.`);
      this.isConnected = false;
    }
  }

  async publicarEvento(routingKey: string, payload: any): Promise<void> {
    const mensaje = JSON.stringify({
      evento: routingKey,
      origen: 'ms-reservas-estadias',
      timestamp: new Date().toISOString(),
      data: payload,
    });

    if (this.isConnected && this.channel) {
      try {
        this.channel.publish('alojate.saga.exchange', routingKey, Buffer.from(mensaje), { persistent: true });
        this.logger.log(`[SAGA] Evento '${routingKey}' publicado a RabbitMQ`);
        return;
      } catch (err: any) {
        this.logger.warn(`Error al publicar en RabbitMQ: ${err.message}`);
      }
    }

    this.logger.log(`[SAGA Emulado] Evento emitido: ${routingKey} -> idReserva: ${payload?.idReserva || payload?.id}`);
  }
}
