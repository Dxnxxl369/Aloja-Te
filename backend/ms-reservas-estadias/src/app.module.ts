import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBService } from './infrastructure/dynamodb/dynamodb.service';
import { DynamoDBReservasRepository } from './infrastructure/dynamodb/dynamodb-reservas.repository';
import { RabbitMQSagaService } from './infrastructure/rabbitmq/rabbitmq-saga.service';
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
    ReservasService,
  ],
})
export class AppModule {}
