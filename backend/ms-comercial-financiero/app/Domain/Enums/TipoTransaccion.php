<?php

namespace App\Domain\Enums;

enum TipoTransaccion: string
{
    case QR_SIMPLE_BNB = 'QR_SIMPLE_BNB';
    case TARJETA_DEBITO = 'TARJETA_DEBITO';
    case TARJETA_CREDITO = 'TARJETA_CREDITO';
    case TIGO_MONEY = 'TIGO_MONEY';
}
