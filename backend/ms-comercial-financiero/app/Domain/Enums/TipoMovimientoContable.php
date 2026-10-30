<?php

namespace App\Domain\Enums;

enum TipoMovimientoContable: string
{
    case DEBITO = 'DEBITO';
    case CREDITO = 'CREDITO';
}
