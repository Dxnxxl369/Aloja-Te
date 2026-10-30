<?php

namespace App\Domain\Enums;

enum TipoCalculo: string
{
    case PORCENTAJE = 'PORCENTAJE';
    case MONTO_FIJO = 'MONTO_FIJO';
}
