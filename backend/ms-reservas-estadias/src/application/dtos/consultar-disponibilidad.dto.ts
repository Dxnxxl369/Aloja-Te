import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ConsultarDisponibilidadDto {
  @IsString()
  @IsNotEmpty()
  idUnidad: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn debe tener formato YYYY-MM-DD' })
  checkIn: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut debe tener formato YYYY-MM-DD' })
  checkOut: string;
}
