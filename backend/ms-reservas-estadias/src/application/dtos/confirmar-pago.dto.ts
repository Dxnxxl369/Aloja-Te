import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class ConfirmarPagoDto {
  @IsUUID()
  @IsNotEmpty()
  pagoId: string;

  @IsString()
  @IsNotEmpty()
  metodoPago: string;

  @IsString()
  @IsOptional()
  transaccionBancariaRef?: string;
}
