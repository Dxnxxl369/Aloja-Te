import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBService } from './infrastructure/dynamodb/dynamodb.service';
import { DynamoDBReservasRepository } from './infrastructure/dynamodb/dynamodb-reservas.repository';
import { RabbitMQSagaService } from './infrastructure/rabbitmq/rabbitmq-saga.service';
import { PagosSagaConsumer } from './infrastructure/rabbitmq/pagos-saga.consumer';
import { ReservasService } from './application/reservas.service';
import { ReservasController } from './presentation/reservas.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [ReservasController],
  providers: [
    DynamoDBService,
    DynamoDBReservasRepository,
    RabbitMQSagaService,
    PagosSagaConsumer,
    ReservasService,
  ],
})
export class AppModule {}
