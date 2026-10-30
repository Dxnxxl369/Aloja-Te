import { IsNotEmpty, IsUUID, IsString, IsNumber, Min, Matches, IsOptional } from 'class-validator';

export class CrearReservaDto {
  @IsUUID()
  @IsNotEmpty()
  idCliente: string;

  @IsString()
  @IsNotEmpty()
  nombreCliente: string;

  @IsUUID()
  @IsNotEmpty()
  idAnfitrion: string;

  @IsUUID()
  @IsNotEmpty()
  idAlojamiento: string;

  @IsString()
  @IsNotEmpty()
  tituloAlojamiento: string;

  @IsUUID()
  @IsNotEmpty()
  idUnidad: string;

  @IsString()
  @IsNotEmpty()
  nombreUnidad: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener formato YYYY-MM-DD' })
  checkIn: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener formato YYYY-MM-DD' })
  checkOut: string;

  @IsNumber()
  @Min(1)
  cantidadHuespedes: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  cantidadUnidades?: number = 1;

  @IsNumber()
  @Min(0)
  precioNoche: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
