<?php

namespace App\Domain\Enums;

enum EstadoLiquidacion: string
{
    case PENDIENTE = 'PENDIENTE';
    case PROCESADA = 'PROCESADA';
    case PAGADA = 'PAGADA';
}
