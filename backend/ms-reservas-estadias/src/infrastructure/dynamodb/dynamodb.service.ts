import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBConfig, DynamoDBConfig } from './dynamodb.config';

@Injectable()
export class DynamoDBService implements OnModuleInit {
  private readonly logger = new Logger(DynamoDBService.name);
  private rawClient: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private isDynamoAvailable = false;
  private config: DynamoDBConfig;

  constructor() {
    this.config = getDynamoDBConfig();
    this.rawClient = new DynamoDBClient({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
    this.docClient = DynamoDBDocumentClient.from(this.rawClient);
  }

  async onModuleInit() {
    await this.verificarYCrearTablaSiEsNecesario();
  }

  private async verificarYCrearTablaSiEsNecesario() {
    try {
      await this.rawClient.send(new DescribeTableCommand({ TableName: this.config.tableName }));
      this.isDynamoAvailable = true;
      this.logger.log(`Tabla DynamoDB '${this.config.tableName}' conectada y verificada.`);
    } catch (error: any) {
      if (error?.name === 'ResourceNotFoundException') {
        this.logger.log(`Tabla '${this.config.tableName}' no encontrada. Creándola en DynamoDB Local...`);
        try {
          await this.crearTablaSingleTable();
          this.isDynamoAvailable = true;
        } catch (createErr: any) {
          this.logger.warn(`No se pudo crear tabla en DynamoDB: ${createErr.message}. Usando modo de memoria local.`);
          this.isDynamoAvailable = false;
        }
      } else {
        this.logger.warn(`DynamoDB no responde en ${this.config.endpoint}. Activando fallback de memoria persistente para desarrollo: ${error.message}`);
        this.isDynamoAvailable = false;
      }
    }
  }

  private async crearTablaSingleTable() {
    const command = new CreateTableCommand({
      TableName: this.config.tableName,
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1Pk', AttributeType: 'S' },
        { AttributeName: 'gsi1Sk', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1_Cliente',
          KeySchema: [
            { AttributeName: 'gsi1Pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1Sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    });

    await this.rawClient.send(command);
    this.logger.log(`Tabla '${this.config.tableName}' creada exitosamente en DynamoDB.`);
  }

  getDocClient(): DynamoDBDocumentClient {
    return this.docClient;
  }

  getTableName(): string {
    return this.config.tableName;
  }

  isAvailable(): boolean {
    return this.isDynamoAvailable;
  }
}
