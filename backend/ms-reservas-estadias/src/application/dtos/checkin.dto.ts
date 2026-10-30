import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class RealizarCheckInDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código de check-in debe tener exactamente 6 dígitos' })
  codigoCheckin: string;

  @IsString()
  @IsOptional()
  notasHuesped?: string;
}
