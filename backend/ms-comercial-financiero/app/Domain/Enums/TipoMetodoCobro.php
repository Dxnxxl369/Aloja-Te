<?php

namespace App\Domain\Enums;

enum TipoMetodoCobro: string
{
    case CUENTA_BANCARIA = 'CUENTA_BANCARIA';
    case QR = 'QR';
    case TIGO_MONEY = 'TIGO_MONEY';
}
