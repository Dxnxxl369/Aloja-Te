import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ConfirmarPagoDto {
  @IsString()
  @IsNotEmpty()
  pagoId: string;

  @IsString()
  @IsNotEmpty()
  metodoPago: string;

  @IsString()
  @IsOptional()
  transaccionBancariaRef?: string;
}
