export interface DynamoDBConfig {
  tableName: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const getDynamoDBConfig = (): DynamoDBConfig => {
  return {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'AlojaTe_Reservas',
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  };
};
