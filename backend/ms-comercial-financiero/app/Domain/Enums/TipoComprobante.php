<?php

namespace App\Domain\Enums;

enum TipoComprobante: string
{
    case FACTURA = 'FACTURA';
    case RECIBO_OFICIAL = 'RECIBO_OFICIAL';
}
